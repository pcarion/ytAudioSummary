package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"
)

// ProcessingStatus represents the status of a processing job
type ProcessingStatus struct {
	SubmissionID string    `json:"submissionId"`
	Status       string    `json:"status"` // "processing", "completed", "failed"
	R2Key        string    `json:"r2Key,omitempty"`
	Error        string    `json:"error,omitempty"`
	StartedAt    time.Time `json:"startedAt"`
	CompletedAt  *time.Time `json:"completedAt,omitempty"`
}

// Global map to track processing status
var (
	statusMap = make(map[string]*ProcessingStatus)
	statusMux sync.RWMutex
)

func handler(w http.ResponseWriter, r *http.Request) {
	country := os.Getenv("CLOUDFLARE_COUNTRY_A2")
	location := os.Getenv("CLOUDFLARE_LOCATION")
	region := os.Getenv("CLOUDFLARE_REGION")
	instanceId := os.Getenv("CLOUDFLARE_DEPLOYMENT_ID")

    // Extract submissionId from URL path
    path := strings.TrimPrefix(r.URL.Path, "/process/")
    if path == "" || path == r.URL.Path {
        log.Println("submissionId is required in URL path: ", r.URL.Path)
        http.Error(w, "submissionId is required in URL path", http.StatusBadRequest)
        return
    }
    submissionId := path

    body, _ := io.ReadAll(r.Body)
    // parse body as json
    var bodyMap map[string]any
    json.Unmarshal(body, &bodyMap)
    log.Println("Handler called")
    log.Println("SubmissionId from URL:", submissionId)
    log.Println("Request body:", bodyMap)
    log.Println("Request body raw:", string(body))
    text := bodyMap["text"].(string)
    if text == "" {
        log.Println("text is required")
        http.Error(w, "text is required", http.StatusBadRequest)
        return
    }

    // Check if already processing
    statusMux.RLock()
    if status, exists := statusMap[submissionId]; exists && status.Status == "processing" {
        statusMux.RUnlock()
        log.Println("Already processing submission:", submissionId)
        response := map[string]any{
            "message": "Processing already in progress",
            "submissionId": submissionId,
            "status": "processing",
        }
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
        return
    }
    statusMux.RUnlock()

    // Create processing status
    status := &ProcessingStatus{
        SubmissionID: submissionId,
        Status:       "processing",
        StartedAt:    time.Now(),
    }

    statusMux.Lock()
    statusMap[submissionId] = status
    statusMux.Unlock()

    // Start processing in goroutine
    go processAsync(submissionId, text, bodyMap, status)

    // Return immediate response
    response := map[string]any{
        "message": "Processing started",
        "submissionId": submissionId,
        "status": "processing",
        "region": region,
        "instanceId": instanceId,
        "country": country,
        "location": location,
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// processAsync handles the actual processing in a goroutine
func processAsync(submissionId, text string, bodyMap map[string]any, status *ProcessingStatus) {
    log.Println("Starting async processing for submission:", submissionId)

    processing := NewProcessing(text)
    processing.WithApiKey(bodyMap["elevenLabsApiToken"].(string))
    processing.WithVoiceIx(0)
    processing.WithOutputFileName("episode.mp3")
    processing.WithR2BucketName(bodyMap["r2BucketName"].(string))
    processing.WithR2AccessKeyId(bodyMap["r2AccessKeyId"].(string))
    processing.WithR2SecretAccessKey(bodyMap["r2SecretAccessKey"].(string))
    processing.WithR2AccountId(bodyMap["r2AccountId"].(string))
    processing.WithR2Prefix(bodyMap["r2Prefix"].(string))

    // Log all processing properties as JSON
    processingJSON, err := json.MarshalIndent(processing, "", "  ")
    if err != nil {
        log.Println("Error marshaling processing object:", err)
    } else {
        log.Println("Processing object properties:")
        log.Println(string(processingJSON))
    }

    if err := processing.IsValid(); err != nil {
        log.Println("Error in async processing:", err)
        status.Status = "failed"
        status.Error = err.Error()
        return
    }

    // Process the text to speech
    r2Key, err := processing.Process()

    statusMux.Lock()
    defer statusMux.Unlock()

    now := time.Now()
    status.CompletedAt = &now

    if err != nil {
        log.Println("Error in async processing:", err)
        status.Status = "failed"
        status.Error = err.Error()
    } else {
        log.Println("Async processing completed successfully for submission:", submissionId)
        status.Status = "completed"
        status.R2Key = r2Key
    }
}

// statusHandler handles status check requests
func statusHandler(w http.ResponseWriter, r *http.Request) {
    // Extract submissionId from URL path
    path := strings.TrimPrefix(r.URL.Path, "/status/")
    if path == "" || path == r.URL.Path {
        log.Println("submissionId is required in URL path: ", r.URL.Path)
        http.Error(w, "submissionId is required in URL path", http.StatusBadRequest)
        return
    }
    submissionId := path

    statusMux.RLock()
    status, exists := statusMap[submissionId]
    statusMux.RUnlock()

    if !exists {
        http.Error(w, "Submission not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(status)
}

func main() {
	// Listen for SIGINT and SIGTERM
	terminate := false
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
    go func() {
		for range stop {
			if terminate {
				os.Exit(0)
				continue
			}

			terminate = true
			go func() {
				time.Sleep(time.Second * 2)
				os.Exit(0)
			}()
		}
	}()
	router := http.NewServeMux()
	router.HandleFunc("POST /process/{submissionId}", handler)
	router.HandleFunc("GET /status/{submissionId}", statusHandler)
	router.HandleFunc("/_health", func(w http.ResponseWriter, r *http.Request) {
        log.Println("Health check called")
		if terminate {
			w.WriteHeader(400)
			w.Write([]byte("draining"))
			return
		}

		w.Write([]byte("ok"))
	})

	server := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	go func() {
		log.Printf("Server listening on %s\n", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// Wait to receive a signal
	sig := <-stop

	log.Printf("Received signal (%s), shutting down server...", sig)

	// Give the server 5 seconds to shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}

	log.Println("Server shutdown successfully")
}

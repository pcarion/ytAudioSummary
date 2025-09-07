package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func handler(w http.ResponseWriter, r *http.Request) {
	country := os.Getenv("CLOUDFLARE_COUNTRY_A2")
	location := os.Getenv("CLOUDFLARE_LOCATION")
	region := os.Getenv("CLOUDFLARE_REGION")
	instanceId := os.Getenv("CLOUDFLARE_DEPLOYMENT_ID")
    body, _ := io.ReadAll(r.Body)
    // parse body as json
    var bodyMap map[string]any
    json.Unmarshal(body, &bodyMap)
    log.Println("Handler called")
    log.Println("Request:", bodyMap)
    log.Println("Request:", string(body))

    submissionId := bodyMap["submissionId"].(string)
    if submissionId == "" {
        log.Println("submissionId is required")
        http.Error(w, "submissionId is required", http.StatusBadRequest)
        return
    }
    text := bodyMap["text"].(string)
    if text == "" {
        log.Println("text is required")
        http.Error(w, "text is required", http.StatusBadRequest)
        return
    }
    processing := NewProcessing(bodyMap["text"].(string))
    processing.WithApiKey(bodyMap["elevenLabsApiToken"].(string))
    processing.WithVoiceIx(0)
    processing.WithOutputFileName("episode.mp3")
    processing.WithR2BucketName(bodyMap["r2BucketName"].(string))
    processing.WithR2AccessKeyId(bodyMap["r2AccessKeyId"].(string))
    processing.WithR2SecretAccessKey(bodyMap["r2SecretAccessKey"].(string))
    processing.WithR2AccountId(bodyMap["r2AccountId"].(string))
    processing.WithR2Prefix(bodyMap["r2Prefix"].(string))

    // process the text to speech
    r2Key, err := processing.Process()
    if err != nil {
        log.Println("Error in processing:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }


    // return JSON response
    response := map[string]any{
        "region": region,
        "instanceId": instanceId,
        "country": country,
        "location": location,
        "submissionId": submissionId,
        "r2Key": r2Key,
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
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
	router.HandleFunc("POST /process", handler)
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

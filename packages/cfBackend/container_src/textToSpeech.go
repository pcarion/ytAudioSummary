package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"time"
)

type voiceModelsDefinition struct {
	voiceId     string
	description string
	disabled    bool
}

var voiceModels = []voiceModelsDefinition{
	{
		// 0
		voiceId:     "kdmDKE6EkgrWrrykO9Qt",
		description: "Alexandra: A super realistic, young female voice that likes to chat",
		disabled:    false,
	},
	{
		// 1
		voiceId:     "L0Dsvb3SLTyegXwtm47J",
		description: "Archer: Grounded and friendly young British male with charm",
		disabled:    false,
	},
	{
		// 2
		voiceId:     "g6xIsTj2HwM6VR4iXFCw",
		description: "Jessica Anne Bogart: Empathetic and expressive, great for wellness coaches",
		disabled:    false,
	},
	{
		// 3
		voiceId:     "OYTbf65OHHFELVut7v2H",
		description: "Hope: Bright and uplifting, perfect for positive interactions",
		disabled:    false,
	},
	{
		// 4
		voiceId:     "dj3G1R1ilKoFKhBnWOzG",
		description: "Eryn: Friendly and relatable, ideal for casual interactions",
		disabled:    false,
	},
	{
		// 5
		voiceId:     "HDA9tsk27wYi3uq0fPcK",
		description: "Stuart: Professional & friendly Aussie, ideal for technical assistance",
		disabled:    false,
	},
	{
		// 6
		voiceId:     "1SM7GgM6IMuvQlz2BwM3",
		description: "Mark: Relaxed and laid back, suitable for non chalant chats",
		disabled:    false,
	},
	{
		// 7
		voiceId:     "PT4nqlKZfc06VW1BuClj",
		description: "Angela: Raw and relatable, great listener and down to earth",
		disabled:    false,
	},
	{
		// 8
		voiceId:     "vBKc2FfBKJfcZNyEt1n6",
		description: "Finn: Tenor pitched, excellent for podcasts and light chats",
		disabled:    false,
	},
	{
		// 9
		voiceId:     "56AoDkrOh6qfVPDXZ7Pt",
		description: "Cassidy: Engaging and energetic, good for entertainment contexts",
		disabled:    false,
	},
	{
		// 10
		voiceId:     "NOpBlnGInO9m6vDvFkFC",
		description: "Grandpa Spuds Oxley: Distinctive character voice for unique agents",
		disabled:    false,
	},
}

type VoiceRequest struct {
	Text          string        `json:"text"`
	ModelID       string        `json:"model_id"`
	VoiceSettings VoiceSettings `json:"voice_settings"`
}

type VoiceSettings struct {
	Speed float64 `json:"speed"`
}

// http query is:
// curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128" \
// -H "xi-api-key: <apiKey>" \
// -H "Content-Type: application/json" \
// -d '{
// "text": "The first move is what sets everything in motion.",
// "model_id": "eleven_multilingual_v2"
// }'

// see:
// https://elevenlabs.io/docs/api-reference/text-to-speech/convert
// https://elevenlabs.io/docs/conversational-ai/best-practices/conversational-voice-design
// const VoiceId = "56AoDkrOh6qfVPDXZ7Pt"
const ModelId = "eleven_multilingual_v2"
const OutputFormat = "mp3_44100_128"

func textToSpeech(text string, apiKey string, voiceIx int, outputFileName string) error {
	requestBody := VoiceRequest{
		Text:    text,
		ModelID: ModelId,
		VoiceSettings: VoiceSettings{
			Speed: 1.0,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=%s", voiceModels[voiceIx].voiceId, OutputFormat)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("xi-api-key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Configure HTTP client with timeout and custom DNS resolver
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout:   10 * time.Second,
				KeepAlive: 30 * time.Second,
			}).DialContext,
			MaxIdleConns:        100,
			IdleConnTimeout:     90 * time.Second,
			TLSHandshakeTimeout: 10 * time.Second,
		},
	}

	// Retry logic for network issues
	var resp *http.Response
	var retryErr error
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		resp, retryErr = client.Do(req)
		if retryErr == nil {
			break
		}
		if i < maxRetries-1 {
			fmt.Printf("Request failed (attempt %d/%d): %v, retrying...\n", i+1, maxRetries, retryErr)
			time.Sleep(time.Duration(i+1) * 2 * time.Second) // Exponential backoff
		}
	}
	if retryErr != nil {
		return fmt.Errorf("failed after %d attempts: %w", maxRetries, retryErr)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Create the output file
	outputFile, err := os.Create(outputFileName)
	if err != nil {
		return err
	}
	defer outputFile.Close()

	// Save the audio data to the output file
	if _, err := io.Copy(outputFile, resp.Body); err != nil {
		return err
	}

	return nil
}

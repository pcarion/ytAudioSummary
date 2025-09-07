package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Processing struct {
	Text string `json:"text"`
	ApiKey string `json:"apiKey"`
	VoiceIx int `json:"voiceIx"`
	OutputFileName string `json:"outputFileName"`
    R2BucketName string `json:"r2BucketName"`
    R2AccessKeyId string `json:"r2AccessKeyId"`
    R2SecretAccessKey string `json:"r2SecretAccessKey"`
    R2AccountId string `json:"r2AccountId"`
    R2Prefix string `json:"r2Prefix"`
}

func NewProcessing(text string) *Processing {
	return &Processing{
		Text: text,
	}
}

func (p *Processing) WithApiKey(apiKey string) *Processing {
	p.ApiKey = apiKey
	return p
}

func (p *Processing) WithVoiceIx(voiceIx int) *Processing {
	p.VoiceIx = voiceIx
	return p
}

func (p *Processing) WithOutputFileName(outputFileName string) *Processing {
	p.OutputFileName = outputFileName
	return p
}

func (p *Processing) WithR2BucketName(r2BucketName string) *Processing {
	p.R2BucketName = r2BucketName
	return p
}

func (p *Processing) WithR2AccessKeyId(r2AccessKeyId string) *Processing {
	p.R2AccessKeyId = r2AccessKeyId
	return p
}

func (p *Processing) WithR2SecretAccessKey(r2SecretAccessKey string) *Processing {
	p.R2SecretAccessKey = r2SecretAccessKey
	return p
}

func (p *Processing) WithR2AccountId(r2AccountId string) *Processing {
	p.R2AccountId = r2AccountId
	return p
}

func (p *Processing) WithR2Prefix(r2Prefix string) *Processing {
	p.R2Prefix = r2Prefix
	return p
}

func (p *Processing) IsValid() error {
	if p.ApiKey == "" {
		return fmt.Errorf("apiKey is required")
	}
	if p.VoiceIx < 0 || p.VoiceIx >= len(voiceModels) {
		return fmt.Errorf("voiceIx is required")
	}
	if p.OutputFileName == "" {
		return fmt.Errorf("outputFileName is required")
	}
	if p.R2BucketName == "" {
		return fmt.Errorf("r2BucketName is required")
	}
	if p.R2AccessKeyId == "" {
		return fmt.Errorf("r2AccessKeyId is required")
	}
	if p.R2SecretAccessKey == "" {
		return fmt.Errorf("r2SecretAccessKey is required")
	}
	if p.R2AccountId == "" {
		return fmt.Errorf("r2AccountId is required")
	}
	if p.R2Prefix == "" {
		return fmt.Errorf("r2Prefix is required")
	}
	return nil
}

func (p *Processing) Process() (string, error) {
    // call textToSpeech
    log.Printf("Calling textToSpeech: (%s) len=%d", p.Text[0:100], len(p.Text))
	err := textToSpeech(p.Text, p.ApiKey, p.VoiceIx, p.OutputFileName)
    if err != nil {
        log.Println("Error in textToSpeech:", err)
        return "", err
    }

    // write output file to r2 bucket
    // https://developers.cloudflare.com/r2/examples/aws/aws-sdk-go/
    r2Key := fmt.Sprintf("%s/%s", p.R2Prefix, p.OutputFileName)

    cfg, err := config.LoadDefaultConfig(context.TODO(),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(p.R2AccessKeyId, p.R2SecretAccessKey, "")),
        config.WithRegion("auto"),
    )
    if err != nil {
        log.Printf("Error loading config: %v", err)
        return "", err
    }

    s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
      o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", p.R2AccountId))
    })

    // read output file
    outputFile, err := os.Open(p.OutputFileName)
    if err != nil {
        log.Printf ("Error opening output file (%s): %v", p.OutputFileName, err)
        return "", err
    }
    defer outputFile.Close()

    _, err = s3Client.PutObject(context.Background(), &s3.PutObjectInput{
        Bucket: &p.R2BucketName,
        Key: &r2Key,
        Body: outputFile,
    })
    if err != nil {
        log.Printf("Error writing to s3 (%s): %v", r2Key, err)
        return "", err
    }


    return r2Key, nil
}

#!/bin/bash

# Test script for YouTube Audio Summary API endpoints
# Make sure the server is running: pnpm dev

# Configuration - Change this to match your server port
BASE_URL="http://localhost:53893"
# Alternative URLs:
# BASE_URL="http://localhost:8787"
# BASE_URL="https://your-production-domain.com"
# BASE_URL="https://your-staging-domain.com"

echo "🧪 Testing YouTube Audio Summary API Endpoints"
echo "=============================================="

# Test Health Check
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.' || echo "❌ Health check failed"
echo ""

# Test Get User Info
echo "2. Testing Get User Info..."
curl -s -X POST "$BASE_URL/trpc/getMe" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.' || echo "❌ Get user info failed"
echo ""

# Test Submit Content (YouTube Video)
echo "3. Testing Submit Content (YouTube Video)..."
curl -s -X POST "$BASE_URL/trpc/submitContent" \
  -H "Content-Type: application/json" \
  -d '{
    "0": {
      "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Rick Astley - Never Gonna Give You Up",
      "domain": "youtube.com",
      "pathName": "/watch",
      "youtubeVideo": {
        "videoId": "dQw4w9WgXcQ",
        "title": "Rick Astley - Never Gonna Give You Up",
        "author": "Rick Astley",
        "shortDescription": "The official video for Never Gonna Give You Up",
        "captions": "Never gonna give you up, never gonna let you down...",
        "isLiveContent": false,
        "lengthSeconds": "212",
        "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
        "thumbnails": [
          {
            "url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
            "width": 1280,
            "height": 720
          }
        ]
      },
      "metadata": [
        {
          "name": "description",
          "value": "The official video for Never Gonna Give You Up by Rick Astley"
        }
      ],
      "sender": {
        "appName": "YouTube Audio Summary Extension",
        "appVersion": "1.0.0",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "osName": "macOS",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      }
    }
  }' | jq '.' || echo "❌ Submit content failed"
echo ""

# Test Submit Content (Web Page)
echo "4. Testing Submit Content (Web Page)..."
curl -s -X POST "$BASE_URL/trpc/submitContent" \
  -H "Content-Type: application/json" \
  -d '{
    "0": {
      "url": "https://example.com/article",
      "title": "Example Article Title",
      "domain": "example.com",
      "pathName": "/article",
      "metadata": [
        {
          "name": "description",
          "value": "This is an example article for testing"
        }
      ],
      "sender": {
        "appName": "YouTube Audio Summary Extension",
        "appVersion": "1.0.0",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "osName": "macOS",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      }
    }
  }' | jq '.' || echo "❌ Submit content failed"
echo ""

# Test Approve Submission
echo "5. Testing Approve Submission..."
curl -s -X POST "$BASE_URL/trpc/approveSubmission" \
  -H "Content-Type: application/json" \
  -d '{
    "0": {
      "submissionId": "sub_1705312200000_abc123def456"
    }
  }' | jq '.' || echo "❌ Approve submission failed"
echo ""

# Test Cancel Submission
echo "6. Testing Cancel Submission..."
curl -s -X POST "$BASE_URL/trpc/cancelSubmission" \
  -H "Content-Type: application/json" \
  -d '{
    "0": {
      "submissionId": "sub_1705312200000_abc123def456"
    }
  }' | jq '.' || echo "❌ Cancel submission failed"
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 To start the server: cd packages/cfBackend && pnpm dev"
echo "💡 To test manually: Use the api.local.http file in VS Code with REST Client extension"

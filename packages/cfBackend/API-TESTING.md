# API Testing Guide

This guide explains how to test the YouTube Audio Summary API endpoints locally.

## Quick Start

1. **Start the development server:**
   ```bash
   cd packages/cfBackend
   pnpm dev
   ```
   The server will start on a random port (check console output for the actual port)

2. **Configure the API URL:**
   - **For VS Code REST Client**: Update `@baseUrl` in `api.local.http`
   - **For test script**: Update `BASE_URL` in `test-endpoints.sh`

3. **Test the endpoints:**
   - Use the `api.local.http` file with VS Code REST Client extension
   - Or run the automated test script: `./test-endpoints.sh`

## Environment Configuration

### Local Development
```bash
# api.local.http
@baseUrl = http://localhost:53893

# test-endpoints.sh
BASE_URL="http://localhost:53893"
```

### Production
```bash
# api.local.http
@baseUrl = https://your-production-domain.com

# test-endpoints.sh
BASE_URL="https://your-production-domain.com"
```

### Staging
```bash
# api.local.http
@baseUrl = https://your-staging-domain.com

# test-endpoints.sh
BASE_URL="https://your-staging-domain.com"
```

## Available Endpoints

### Health Check
- **GET** `/health` - Check if the server is running

### tRPC Endpoints
All tRPC endpoints use **POST** requests with JSON payloads.

#### Submit Content
- **POST** `/trpc/submitContent`
- Submit YouTube videos or web pages for processing
- Supports both YouTube videos (with metadata) and regular web pages

#### Approve Submission
- **POST** `/trpc/approveSubmission`
- Approve a submitted content for processing

#### Cancel Submission
- **POST** `/trpc/cancelSubmission`
- Cancel a submitted content

#### Get User Info
- **POST** `/trpc/getMe`
- Get current user information and feed

## Testing Methods

### 1. VS Code REST Client Extension
1. Install the "REST Client" extension in VS Code
2. Open `api.local.http`
3. Update the `@baseUrl` variable at the top to match your server port
4. Click "Send Request" above each endpoint

### 2. Automated Test Script
1. Update the `BASE_URL` variable in `test-endpoints.sh` to match your server port
2. Run the script:
   ```bash
   ./test-endpoints.sh
   ```

### 3. Manual cURL Commands
```bash
# Health check (replace PORT with your actual port)
curl http://localhost:PORT/health

# Get user info (replace PORT with your actual port)
curl -X POST http://localhost:PORT/trpc/getMe \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Request Format

tRPC requests use a specific format where the input parameters are wrapped in a `"0"` key:

```json
{
  "0": {
    // Your input parameters here
  }
}
```

## Response Format

All responses follow the tRPC format:

```json
{
  "result": {
    "data": {
      // Your response data here
    }
  }
}
```

## Error Handling

The API includes validation using Zod schemas. Invalid requests will return detailed error messages:

```json
{
  "error": {
    "message": "Validation error",
    "code": -32600,
    "data": {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["url"]
    }
  }
}
```

## Example Requests

See `api.local.http` for complete examples including:
- YouTube video submission with full metadata
- Web page submission
- Batch requests
- Error handling scenarios
- Authorization headers

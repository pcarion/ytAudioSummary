# YouTube Audio Summary - Cloudflare Backend

A serverless backend built on Cloudflare Workers that processes YouTube video content and generates AI-powered audio summaries.

## 🚀 Features

- **Serverless Architecture**: Built on Cloudflare Workers with Durable Objects and Workflows
- **AI Integration**: Google Gemini for text summarization and ElevenLabs for text-to-speech
- **Async Processing**: Long-running workflows with status tracking and retry logic
- **Type-safe APIs**: tRPC endpoints with end-to-end TypeScript support
- **Storage**: R2 buckets for audio files and D1 database for metadata
- **Container Support**: Go-based containers for TTS processing

## 🏗️ Architecture

- **Runtime**: Cloudflare Workers with Durable Objects and Workflows
- **API Framework**: [Hono](https://hono.dev/) with [tRPC](https://trpc.io/) for type-safe APIs
- **Database**: D1 (SQLite) with Drizzle ORM for type-safe queries
- **Storage**: R2 buckets for audio files and static assets
- **AI Services**: Google Gemini API and ElevenLabs TTS
- **Containers**: Go-based Docker containers for audio processing

## 📦 Project Structure

```
src/
├── router/            # API routes and tRPC procedures
├── workflows/         # Cloudflare Workflows for async processing
├── containers/        # Durable Object containers
├── db/               # Database schema and queries
└── worflows/         # Workflow step implementations

container_src/        # Go source for TTS containers
├── main.go          # HTTP server for container
├── textToSpeech.go  # ElevenLabs TTS integration
└── processing.go    # Audio processing logic
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start local development server
pnpm start            # Alias for dev command

# Deployment
pnpm build            # Build and validate (dry-run)
pnpm deploy           # Deploy to Cloudflare Workers

# Testing
pnpm test             # Run test suite with Vitest

# Code Quality
pnpm lint             # Run linting with Biome
pnpm lint:fix         # Fix linting issues automatically
pnpm format           # Format code with Biome
pnpm format:fix       # Fix formatting issues automatically
pnpm type-check       # Run TypeScript type checking
pnpm verify           # Run lint, type-check, and build

# Database Management
pnpm db:generate      # Generate database migrations
pnpm db:migrate       # Apply migrations to D1
pnpm db:push          # Push schema changes to D1
pnpm db:studio        # Open Drizzle Studio
pnpm db:drop          # Drop database (use with caution)
pnpm db:check         # Check database configuration

# Cloudflare
pnpm cf-typegen       # Generate Cloudflare types
```

### Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Cloudflare and API keys
   ```

3. **Start development**:
   ```bash
   pnpm dev
   ```

4. **Deploy to production**:
   ```bash
   pnpm deploy
   ```

## 🔧 Key Components

- **API Router**: tRPC-based endpoints for submission management
- **Workflows**: Async processing pipelines for video summarization
- **Durable Objects**: Stateful containers for TTS processing
- **Database**: D1 with Drizzle ORM for metadata storage
- **Storage**: R2 buckets for audio file storage
- **Error Handling**: Comprehensive error handling with retry logic

## 🌐 API Endpoints

- **Submissions**: Create, approve, and manage video submissions
- **Feed**: Generate and serve RSS feeds for audio content
- **Status**: Real-time processing status and health checks
- **Webhooks**: Integration points for external services

## 🔗 External Services

- **Google Gemini**: AI text summarization
- **ElevenLabs**: High-quality text-to-speech synthesis
- **Cloudflare R2**: Object storage for audio files
- **Cloudflare D1**: SQLite database for metadata

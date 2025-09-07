# YouTube Audio Summary

A web extension that automatically captures YouTube video content and generates AI-powered audio summaries.

![Extension Screenshot](docs/screenshots/screenshot01.png)

## 🚀 What It Does

- **Captures YouTube Content**: Automatically extracts video metadata, captions, and thumbnails
- **AI-Powered Summarization**: Uses Google Gemini to create concise video summaries
- **Text-to-Speech**: Converts summaries to high-quality audio using ElevenLabs
- **Browser Integration**: Seamless YouTube.com integration with sidepanel interface

![Feed Screenshot](docs/screenshots/screenshot02.png)

## 🏗️ Architecture

### Frontend (Web Extension)
- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **UI**: React with Tailwind CSS and shadcn/ui components
- **Type Safety**: Full TypeScript integration with tRPC client

### Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers with Durable Objects and Workflows
- **API**: [Hono](https://hono.dev/) framework with [tRPC](https://trpc.io/) for type-safe APIs
- **Storage**: R2 buckets for audio files and D1 database for metadata
- **Processing**: Go containers for TTS processing with ElevenLabs integration

## 📦 Project Structure

```
packages/
├── webExtension/     # Browser extension (WXT + React)
└── cfBackend/        # Cloudflare Workers backend
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm package manager
- Cloudflare account

### Available Scripts

```bash
# Development
pnpm dev              # Start all packages in development mode
pnpm build            # Build all packages for production

# Code Quality
pnpm lint             # Run linting across all packages
pnpm lint:fix         # Fix linting issues automatically
pnpm format           # Format code with Biome
pnpm format:fix       # Fix formatting issues automatically
pnpm type-check       # Run TypeScript type checking

```

### Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development**:
   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

## 🔧 Key Features

- **Real-time Processing**: Asynchronous workflow processing with status tracking
- **Multi-voice Support**: Configurable TTS voices and prompts
- **Error Handling**: Comprehensive error handling with retry logic
- **Dark Mode**: Full dark mode support across the extension
- **Type Safety**: End-to-end TypeScript with shared type definitions

## 🙏 Acknowledgments

- [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Hono](https://hono.dev/) - Fast, Lightweight, Web-standards
- [Biome](https://biomejs.dev/) - Fast formatter and linter
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [ElevenLabs](https://elevenlabs.io/) - AI voice synthesis
- [Google Gemini](https://ai.google.dev/) - AI text generation

# YouTube Audio Summary with Web Extension and Cloudflare Backend

A comprehensive solution for capturing and processing YouTube audio using modern web technologies, featuring a browser extension built with [WXT](https://wxt.dev/) and a Cloudflare Workers backend using [Hono](https://hono.dev/) and [tRPC](https://trpc.io/).

## 🏗️ Project Structure

This project is organized as a monorepo with three main packages:

```
ytAudioSummary/
├── packages/
│   ├── apiDefinition/        # Shared API definitions using tRPC and Hono
│   ├── webExtension/         # Browser extension using WXT framework
│   └── cfBackend/            # Cloudflare Workers backend
├── pnpm-workspace.yaml       # PNPM workspace configuration
├── biome.json               # Biome configuration for linting and formatting
└── package.json              # Root package configuration
```

### 📦 Package Details

#### `@yt-audio-summary/api-definition`
- **Purpose**: Shared API definitions and TypeScript interfaces
- **Technologies**: tRPC, Hono, Zod validation
- **Contents**: API router, input validation schemas, shared types
- **Usage**: Imported by both webExtension and cfBackend packages

#### `@yt-audio-summary/web-extension`
- **Purpose**: Browser extension for YouTube audio capture
- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **Features**: 
  - Audio stream capture from YouTube videos
  - tRPC client integration
  - User-friendly popup interface
  - Content script injection into YouTube pages
- **Target**: Chrome, Firefox, Edge, Safari (MV2 and MV3)

#### `@yt-audio-summary/cf-backend`
- **Purpose**: Cloudflare Workers backend for API processing
- **Technologies**: Hono, tRPC, Cloudflare Workers
- **Features**:
  - HTTP JSON API endpoints
  - tRPC server implementation
  - Audio data processing
  - Scalable serverless architecture

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PNPM 8+
- Chrome browser (for extension testing)
- Cloudflare account (for backend deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ytAudioSummary
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build all packages**
   ```bash
   pnpm build
   ```

## 🛠️ Development

### Available Scripts

- `pnpm build` - Build all packages
- `pnpm dev` - Start development mode for all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages using Biome
- `pnpm lint:fix` - Fix auto-fixable linting issues
- `pnpm format` - Format code using Biome
- `pnpm format:fix` - Fix formatting issues
- `pnpm clean` - Clean build outputs
- `pnpm type-check` - Type check all packages
- `pnpm verify` - Run lint, type-check, and build (full verification)

### Package-Specific Commands

#### API Definition Package
```bash
cd packages/apiDefinition
pnpm build      # Build TypeScript
pnpm dev        # Watch mode
pnpm clean      # Clean dist folder
pnpm type-check # Type check only
pnpm verify     # Full verification
```

#### Web Extension Package
```bash
cd packages/webExtension
pnpm build      # Build with WXT
pnpm dev        # Development mode with hot reload
pnpm zip        # Create extension package
pnpm clean      # Clean build outputs
pnpm verify     # Full verification
```

#### Cloudflare Backend Package
```bash
cd packages/cfBackend
pnpm build      # Build TypeScript
pnpm dev        # Start Wrangler dev server
pnpm deploy     # Deploy to Cloudflare
pnpm clean      # Clean dist folder
pnpm verify     # Full verification
```

## 🔧 Configuration

### Biome Configuration

The project uses [Biome](https://biomejs.dev/) for linting and formatting, configured in `biome.json`:

- **Linting**: Strict rules for code quality and consistency
- **Formatting**: Consistent code style across all packages
- **Type Safety**: Warnings for `any` usage and unused variables
- **Performance**: Optimized for modern JavaScript/TypeScript

### Web Extension Configuration

The extension is configured via `packages/webExtension/wxt.config.ts`:

- **Manifest**: MV3 with permissions for YouTube and Cloudflare domains
- **Entry Points**: Background service worker, content script, popup
- **Build**: Vite-based with ES modules

### Cloudflare Backend Configuration

Configure via `packages/cfBackend/wrangler.toml`:

- **Worker Name**: `yt-audio-summary-backend`
- **KV Namespaces**: For audio caching
- **R2 Buckets**: For audio storage
- **Environments**: Production and staging configurations

### tRPC API Configuration

The shared API is defined in `packages/apiDefinition/src/`:

- **Router**: Main API endpoints with Zod validation
- **Procedures**: Input/output schemas and business logic
- **Middleware**: Authentication, logging, and rate limiting

## 📱 Usage

### Installing the Extension

1. Build the extension: `cd packages/webExtension && pnpm build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select `packages/webExtension/.output/`

### Using the Extension

1. Navigate to any YouTube video
2. Click the extension icon in your browser toolbar
3. Click "Connect" to establish connection to backend
4. Click "Start Capture" to begin audio capture
5. Audio data will be streamed to the Cloudflare backend for processing

### API Endpoints

#### tRPC Endpoints
- `/trpc/health` - Health check
- `/trpc/processAudio` - Process audio data
- `/trpc/getAnalysis` - Get analysis results
- `/trpc/listAnalyses` - List analyses with pagination

#### REST Endpoints
- `/api/health` - Health check
- `/api/analyses` - List analyses

## 🔌 API Reference

### Audio Stream Data

```typescript
interface AudioStreamData {
  audioChunk: ArrayBuffer;
  sampleRate: number;
  channels: number;
  timestamp: number;
  videoId?: string;
}
```

### Analysis Results

```typescript
interface AudioAnalysisResult {
  id: string;
  videoId: string;
  summary: string;
  transcript: string;
  duration: number;
  processedAt: Date;
  confidence: number;
}
```

### tRPC Client Usage

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@yt-audio-summary/api-definition';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://your-backend-url.com/trpc',
    }),
  ],
});

// Use the client
const result = await trpc.processAudio.mutate(audioData);
const analysis = await trpc.getAnalysis.query({ videoId: 'abc123' });
```

## 🏗️ Architecture

### Data Flow

1. **Audio Capture**: Extension captures audio from YouTube video
2. **tRPC Communication**: Audio data sent via tRPC to Cloudflare backend
3. **Processing**: Backend processes audio data for analysis
4. **Storage**: Results stored in Cloudflare KV/R2
5. **Response**: Analysis results sent back to extension

### Technology Stack

- **Frontend**: WXT (Web Extension Framework)
- **Backend**: Cloudflare Workers + Hono
- **API**: tRPC for type-safe communication
- **Validation**: Zod for runtime type checking
- **Linting/Formatting**: Biome for code quality
- **Build Tools**: TypeScript, Vite, Wrangler

## 🚀 Deployment

### Cloudflare Backend

1. **Configure Wrangler**
   ```bash
   cd packages/cfBackend
   pnpm wrangler login
   ```

2. **Deploy**
   ```bash
   pnpm deploy
   ```

3. **Environment Variables**
   - Set KV namespace IDs in `wrangler.toml`
   - Configure R2 bucket names
   - Set up custom domains if needed

### Extension Distribution

1. **Build for Production**
   ```bash
   cd packages/webExtension
   pnpm build
   ```

2. **Package for Web Store**
   ```bash
   pnpm zip
   ```

3. **Submit to Browser Stores**
   - Chrome Web Store
   - Firefox Add-ons
   - Edge Add-ons

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/apiDefinition && pnpm test
```

### Code Quality Verification

```bash
# Full verification (lint + type-check + build)
pnpm verify

# Individual checks
pnpm lint        # Lint all packages
pnpm type-check  # Type check all packages
pnpm build       # Build all packages
```

### Manual Testing

1. **Extension Testing**
   - Load extension in browser
   - Test on various YouTube videos
   - Verify audio capture functionality

2. **Backend Testing**
   - Use Wrangler dev server
   - Test tRPC endpoints
   - Verify audio processing

## 🔒 Security Considerations

- **Audio Permissions**: Extension requests minimal audio access
- **HTTPS Only**: All API communication requires secure context
- **Input Validation**: Zod schemas validate all inputs
- **CORS**: Properly configured for extension domains
- **Rate Limiting**: Built-in middleware for API protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run verification: `pnpm verify`
5. Add tests if applicable
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include browser version and extension version
4. Provide steps to reproduce the problem

## 🔮 Future Enhancements

- [ ] AI-powered audio summarization
- [ ] Real-time transcription
- [ ] Multi-language support
- [ ] Advanced audio analysis
- [ ] User preferences and settings
- [ ] Analytics and insights dashboard
- [ ] Offline processing capabilities
- [ ] Batch processing for multiple videos

## 🙏 Acknowledgments

- [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Hono](https://hono.dev/) - Fast, Lightweight, Web-standards
- [Biome](https://biomejs.dev/) - Fast formatter and linter
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
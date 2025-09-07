# YouTube Audio Summary - Browser Extension

A modern browser extension built with [WXT](https://wxt.dev/) and React that seamlessly integrates with YouTube to capture video content and generate AI-powered audio summaries.

## 🚀 Features

- **YouTube Integration**: Automatically detects and captures video metadata, captions, and thumbnails
- **Sidepanel Interface**: Clean, modern UI accessible via browser sidepanel
- **Real-time Status**: Live updates on processing status with visual indicators
- **Dark Mode Support**: Full dark/light theme support
- **Type-safe APIs**: End-to-end TypeScript with tRPC integration
- **Cross-browser**: Supports Chrome, Firefox, and other Chromium-based browsers

## 🏗️ Architecture

- **Framework**: [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- **UI Library**: React 19 with Tailwind CSS and shadcn/ui components
- **State Management**: React hooks with tRPC for server state
- **Type Safety**: Full TypeScript integration with shared API types
- **Styling**: Tailwind CSS with custom dark mode support

## 📦 Project Structure

```
entrypoints/
├── sidepanel/        # Main extension interface
│   ├── home/         # Home page with pending submissions
│   ├── feed/         # RSS feed viewer
│   └── settings/     # Extension settings
├── background.ts     # Service worker
└── content.ts        # Content script for YouTube integration

components/
└── ui/               # Reusable UI components (shadcn/ui)

lib/
├── ApiContext/       # tRPC client setup
├── trpc/            # API client configuration
└── types/           # TypeScript type definitions
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server (Chrome)
pnpm dev:firefox      # Start development server (Firefox)

# Building
pnpm build            # Build extension for production (Chrome)
pnpm build:firefox    # Build extension for production (Firefox)

# Packaging
pnpm zip              # Create distributable ZIP (Chrome)
pnpm zip:firefox      # Create distributable ZIP (Firefox)

# Code Quality
pnpm format           # Format code with Biome
pnpm format:fix       # Fix formatting issues automatically
pnpm type-check       # Run TypeScript type checking
pnpm verify           # Run lint, type-check, and build
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

3. **Load extension**:
   - Open Chrome/Edge: `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `.output/chrome-mv3` folder

4. **Build for production**:
   ```bash
   pnpm build
   pnpm zip
   ```

## 🔧 Key Components

- **Content Script**: Injects into YouTube pages to capture video data
- **Background Service**: Handles API communication and data processing
- **Sidepanel**: Main user interface with tabs for different features
- **API Integration**: Type-safe communication with Cloudflare backend
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🎨 UI Features

- **Responsive Design**: Works across different screen sizes
- **Accessibility**: ARIA labels and keyboard navigation support
- **Loading States**: Visual feedback for async operations
- **Error States**: Clear error messages and retry mechanisms
- **Status Indicators**: Real-time processing status updates

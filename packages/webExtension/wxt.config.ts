import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'YouTube Audio Summary',
    description: 'Capture and analyze YouTube audio using AI',
    version: '1.0.0',
    manifest_version: 3,
    permissions: [
      'activeTab',
      'storage',
      'tabs'
    ],
    host_permissions: [
      'https://www.youtube.com/*',
      'https://*.cloudflare.com/*'
    ],
    action: {
      default_popup: 'src/popup/index.html',
      default_title: 'YouTube Audio Summary'
    },
    icons: {
      '16': 'src/assets/icon16.png',
      '48': 'src/assets/icon48.png',
      '128': 'src/assets/icon128.png'
    }
  },
  vite: () => ({
    build: {
      target: 'esnext'
    }
  })
});

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
    content_scripts: [
      {
        matches: ['https://www.youtube.com/*'],
        js: ['entrypoints/contentScript.ts']
      }
    ],
    background: {
      service_worker: 'entrypoints/backgroundScript.ts'
    },
    action: {
      default_popup: 'popup/index.html',
      default_title: 'YouTube Audio Summary'
    },
    icons: {
      '16': 'assets/icon16.png',
      '48': 'assets/icon48.png',
      '128': 'assets/icon128.png'
    }
  },
  vite: () => ({
    build: {
      target: 'esnext'
    },
    css: {
      postcss: './postcss.config.js'
    }
  })
});

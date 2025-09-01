import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "ytAudioSummary",
    description: "YouTube Audio Summary",
    version: "1.0.0",
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      96: "icon/96.png",
      128: "icon/128.png",
    },
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
    permissions: ["sidePanel", "storage", "activeTab"],
    host_permissions: ["*://*.youtube.com/*"],
  },
  vite: () => ({
    css: {
      postcss: "./postcss.config.js",
    },
  }),
});

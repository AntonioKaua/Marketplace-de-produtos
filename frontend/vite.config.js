import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const apiProxy = {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ""),
  },
};

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "prompt",

      includeAssets: [
        "icons/apple-touch-icon.png",
      ],

      manifest: {
        id: "/",
        name: "DTS Marketplace",
        short_name: "DTS",
        description: "Compre e venda produtos no DTS Marketplace.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#1d4ed8",

        icons: [
          {
            src: "/icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,png,svg,ico,webmanifest}",
        ],

        cleanupOutdatedCaches: true,

        navigateFallback: "/index.html",

        navigateFallbackDenylist: [
          /^\/api(?:\/|$)/,
        ],

        // Somente os arquivos estáticos do build ficam no cache.
        // As respostas da API e de serviços externos não são armazenadas.
        runtimeCaching: [],
      },
    }),
  ],

  server: {
    port: 5173,
    proxy: apiProxy,
  },

  preview: {
    port: 4173,
    proxy: apiProxy,
  },
});
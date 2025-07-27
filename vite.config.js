import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import { VitePWA } from 'vite-plugin-pwa';
import vercel from 'vite-plugin-vercel';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: process.env.PORT,
  },
  plugins: [
    tsconfigPaths(),
    vercel(),
    react(),
    monacoEditorPlugin({
      languageWorkers: ['typescript', 'editorWorkerService'] // 'javascript' worker is usually covered by 'typescript'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Visual Fiha',
        short_name: 'Fiha',
        description: 'Browser-based creative coding platform for interactive visuals.',
        start_url: '.',
        display: 'standalone',
        background_color: '#181818',
        theme_color: '#181818',
        icons: [
          {
            src: '/vf.icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/vf.icon.alt.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/vf.icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB for large Monaco/worker assets
      },
    }),
  ],
});
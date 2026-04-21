import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 5173),
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss({}),
    react(),
    monacoEditorPlugin({
      languageWorkers: ["typescript", "editorWorkerService"], // 'javascript' worker is usually covered by 'typescript'
    }),
  ],
});

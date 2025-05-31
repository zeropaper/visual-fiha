import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['typescript', 'editorWorkerService'] // 'javascript' worker is usually covered by 'typescript'
    }),
  ],
});
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentMatchGlobs: [
      ['**/*.dom.test.{ts,tsx,js,jsx}', 'jsdom'],
      ['**/*.test.{ts,tsx,js,jsx}', 'node'],
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // environment: 'jsdom',
    // environmentMatchGlobs: [
    //   ['**/*.dom.test.{ts,tsx,js,jsx}', 'jsdom'],
    //   ['**/*.test.{ts,tsx,js,jsx}', 'node'],
    // ],
    projects: [
      {
        test: {
          include: ['./src/**/*.test.dom.{ts,tsx,js,jsx}'],
          environment: 'jsdom',
        }
      },
      {
        test: {
          include: ['./src/**/*.test.{ts,tsx,js,jsx}'],
          environment: 'node',
        }
      },
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});

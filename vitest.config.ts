/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
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
          include: ["./src/**/*.test.dom.{ts,tsx,js,jsx}"],
          environment: "jsdom",
        },
      },
      {
        test: {
          include: ["./src/**/*.test.{ts,tsx,js,jsx}"],
          environment: "node",
        },
      },
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});

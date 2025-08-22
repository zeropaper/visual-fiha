/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
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
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});

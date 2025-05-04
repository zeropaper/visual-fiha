import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Equivalent to Jest's collectCoverage: false
        coverage: {
            enabled: false,
            provider: 'v8',
            // Equivalent to Jest's coverageDirectory: 'coverage'
            reportsDirectory: './coverage',
        },
        // Default environment setup
        environment: 'node',

        // Include the same file patterns as Jest would
        include: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

        // Configure environments for different test files if needed
        environmentMatchGlobs: [
            // For tests that need DOM access
            ['**/*.dom.test.{ts,tsx,js,jsx}', 'jsdom'],
        ]
    }
});
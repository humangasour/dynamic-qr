import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/utils/global.ts'],
    // Test file patterns
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}', 'src/**/*.{test,spec}.{js,ts,tsx}'],
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'tests/fixtures/**',
      'tests/utils/**',
      'tests/e2e/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './tests'),
    },
  },
});

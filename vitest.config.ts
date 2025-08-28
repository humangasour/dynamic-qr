import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup/global.ts'],
    // Test file patterns
    include: ['src/**/__tests__/**/*.{test,spec}.{js,ts,tsx}', 'src/**/*.{test,spec}.{js,ts,tsx}'],
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'src/**/__tests__/fixtures/**',
      'src/**/__tests__/helpers/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/__tests__'),
    },
  },
});

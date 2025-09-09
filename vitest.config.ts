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
    // Narrow coverage scope to core logic
    coverage: {
      all: true,
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/shared/utils/**',
        'src/shared/schemas/**',
        'src/lib/**',
        'src/features/auth/server.ts',
        'src/infrastructure/trpc/routers/**',
      ],
      exclude: [
        'src/i18n/**',
        'src/shared/types/**',
        'src/infrastructure/supabase/**',
        'src/infrastructure/trpc/client.ts',
        'src/infrastructure/trpc/provider.tsx',
        'src/infrastructure/trpc/server-client.ts',
        'src/infrastructure/trpc/server-caller.ts',
        'src/infrastructure/trpc/utils.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './tests'),
      '@features': resolve(__dirname, './src/features'),
      '@infra': resolve(__dirname, './src/infrastructure'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
});

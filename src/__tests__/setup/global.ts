import { beforeEach } from 'vitest';

import { cleanupGlobalMocks, setupGlobalMocks } from './mocks';

// Setup global mocks
setupGlobalMocks();

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  cleanupGlobalMocks();
});

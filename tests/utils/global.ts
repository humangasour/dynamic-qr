import { beforeEach } from 'vitest';
import { z } from 'zod';

import en from '../../src/i18n/messages/en.json';
import type { Messages } from '../../src/i18n/config';
import { buildZodErrorMap } from '../../src/i18n/zod';

function t(key: string, values?: Record<string, unknown>) {
  const parts = key.split('.');
  // Deep lookup in messages without using `any`
  let cur: unknown = en as Messages;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      cur = undefined;
      break;
    }
  }
  let msg = typeof cur === 'string' ? cur : key;
  if (values && typeof msg === 'string') {
    for (const [k, v] of Object.entries(values)) {
      msg = msg.replace(new RegExp(String.raw`\{${k}\}`, 'g'), String(v));
    }
  }
  return msg;
}

// Apply localized error messages globally for tests using z.config customError
const map = buildZodErrorMap(t);
z.config({
  customError: (iss) =>
    map(iss as unknown as Parameters<typeof map>[0], { defaultError: 'Invalid input' }).message,
});

import { cleanupGlobalMocks, setupGlobalMocks } from './supabase';

// Setup global mocks
setupGlobalMocks();

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  cleanupGlobalMocks();
});

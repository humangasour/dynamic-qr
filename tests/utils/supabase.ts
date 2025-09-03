import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

import type { Database } from '@shared/types';

// Global mocks for Supabase
export const createMockSupabaseClient = () =>
  ({
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        limit: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  }) as unknown as SupabaseClient<Database>;

// Mock environment variables
export const mockEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
};

// Global mock setup
export const setupGlobalMocks = () => {
  // Mock environment variables
  Object.entries(mockEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

// Clean up mocks
export const cleanupGlobalMocks = () => {
  vi.clearAllMocks();
};

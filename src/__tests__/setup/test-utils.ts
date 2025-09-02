import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

import type { Database } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase/clients';

import { testUsers, testOrganizations } from '../fixtures';

// Test utilities for common test scenarios
export class TestUtils {
  static createMockRpcResponse<T>(
    data: T,
    error: { message: string; code?: string } | null = null,
  ) {
    return {
      data,
      error,
    };
  }

  static createMockQueryResponse<T>(
    data: T[],
    error: { message: string; code?: string } | null = null,
  ) {
    return {
      data,
      error,
    };
  }

  static createMockSingleResponse<T>(
    data: T | null,
    error: { message: string; code?: string } | null = null,
  ) {
    return {
      data,
      error,
    };
  }

  // Helper to mock successful RPC call
  static mockSuccessfulRpc<T>(mockClient: SupabaseClient<Database>, data: T) {
    (
      mockClient.rpc as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue({
      data,
      error: null,
    });
  }

  // Helper to mock failed RPC call
  static mockFailedRpc(
    mockClient: SupabaseClient<Database>,
    error: { message: string; code?: string },
  ) {
    (
      mockClient.rpc as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue({
      data: null,
      error,
    });
  }

  // Helper to mock empty RPC response
  static mockEmptyRpc(mockClient: SupabaseClient<Database>) {
    (
      mockClient.rpc as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue({
      data: [],
      error: null,
    });
  }

  // Helper to create test data
  static createTestQrCode(
    overrides: Partial<Database['public']['Tables']['qr_codes']['Row']> = {},
  ) {
    return {
      id: 'test-qr-id',
      org_id: 'test-org-id',
      name: 'Test QR Code',
      slug: 'test-slug',
      current_target_url: 'https://example.com',
      status: 'active' as const,
      created_by: 'test-user-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides,
    };
  }

  static createTestUser(overrides: Partial<Database['public']['Tables']['users']['Row']> = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides,
    };
  }

  static createTestOrganization(
    overrides: Partial<Database['public']['Tables']['orgs']['Row']> = {},
  ) {
    return {
      id: 'test-org-id',
      name: 'Test Organization',
      plan: 'free' as const,
      stripe_customer_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      ...overrides,
    };
  }

  static createTestScanEvent(
    overrides: Partial<Database['public']['Tables']['scan_events']['Row']> = {},
  ) {
    return {
      id: 1,
      qr_id: 'test-qr-id',
      ts: '2024-01-01T00:00:00Z',
      ip_hash: 'test-ip-hash',
      user_agent: 'Test Browser',
      referrer: 'https://example.com',
      country: 'US',
      city: 'Test City',
      ...overrides,
    };
  }

  // Helper to wait for async operations
  static async waitFor(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper to create a mock function with specific return values
  static createMockFunction<T extends (...args: unknown[]) => unknown>(implementation?: T) {
    return vi.fn(implementation);
  }
}

// Database test helpers for integration tests
export function createTestUser(
  overrides: Partial<Database['public']['Tables']['users']['Row']> = {},
): Database['public']['Tables']['users']['Row'] {
  // Use fixtures instead of creating users dynamically
  const baseUser = testUsers[0]; // Use first test user as base

  return {
    ...baseUser,
    ...overrides,
  };
}

export function getTestUser(id: string): Database['public']['Tables']['users']['Row'] | undefined {
  return testUsers.find((user) => user.id === id);
}

export function getTestUserByEmail(
  email: string,
): Database['public']['Tables']['users']['Row'] | undefined {
  return testUsers.find((user) => user.email === email);
}

export function getTestOrganization(
  id: string,
): Database['public']['Tables']['orgs']['Row'] | undefined {
  return testOrganizations.find((org) => org.id === id);
}

export async function cleanupTestData() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return; // Skip cleanup if no admin client
  }

  try {
    // Clean up in reverse dependency order
    await supabase.from('scan_events').delete().neq('id', 0);
    await supabase.from('qr_codes').delete().neq('id', '');
    await supabase.from('org_members').delete().neq('user_id', '');
    await supabase.from('orgs').delete().neq('id', '');
    await supabase.from('users').delete().neq('id', '');
  } catch (error) {
    // Ignore cleanup errors in tests
    console.warn('Cleanup error (ignored):', error);
  }
}

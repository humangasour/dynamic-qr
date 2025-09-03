import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { testOrganizations, testQrCodes, testUsers } from '@test/fixtures';
import type { Database } from '@/types';

// API test helpers
export class ApiTestHelpers {
  static mockRpcCall<T>(
    mockClient: SupabaseClient<Database>,
    functionName: string,
    data: T,
    error: { message: string; code?: string } | null = null,
  ) {
    (
      mockClient.rpc as unknown as { mockImplementation: (fn: (name: string) => unknown) => void }
    ).mockImplementation((fnName: string) => {
      if (fnName === functionName) {
        return Promise.resolve({ data, error });
      }
      return Promise.resolve({ data: null, error: { message: 'Function not found' } });
    });
  }

  static mockHandleRedirect(
    mockClient: SupabaseClient<Database>,
    shouldReturnUrl: boolean = true,
    targetUrl: string = 'https://example.com',
  ) {
    const data = shouldReturnUrl ? [{ target_url: targetUrl }] : [];
    (
      mockClient.rpc as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue({ data, error: null });
  }

  static mockHandleRedirectError(
    mockClient: SupabaseClient<Database>,
    errorMessage: string = 'Test error',
    errorCode: string = 'TEST_ERROR',
  ) {
    (
      mockClient.rpc as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue({ data: null, error: { message: errorMessage, code: errorCode } });
  }

  // Helper to simulate network delays
  static async simulateNetworkDelay(ms: number = 100) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper to create mock fetch responses
  static createMockFetchResponse(data: unknown, status: number = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    };
  }
}

// Database test helpers
export class DatabaseTestHelpers {
  static mockQrCodeQuery(
    mockClient: SupabaseClient<Database>,
    slug: string,
    shouldExist: boolean = true,
  ) {
    const qrCode = testQrCodes.find((qr) => qr.slug === slug);

    if (shouldExist && qrCode) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: qrCode, error: null }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found', code: 'PGRST116' },
              }),
            }),
          }),
        },
      );
    }
  }

  static mockScanEventInsert(mockClient: SupabaseClient<Database>, shouldSucceed: boolean = true) {
    if (shouldSucceed) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Insert failed', code: '23505' },
              }),
            }),
          }),
        },
      );
    }
  }

  static mockUserQuery(mockClient: SupabaseClient<Database>, userId: string, shouldExist = true) {
    const user = testUsers.find((u) => u.id === userId);

    if (shouldExist && user) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: user, error: null }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found', code: 'PGRST116' },
              }),
            }),
          }),
        },
      );
    }
  }

  static mockOrganizationQuery(
    mockClient: SupabaseClient<Database>,
    orgId: string,
    shouldExist: boolean = true,
  ) {
    const org = testOrganizations.find((o) => o.id === orgId);

    if (shouldExist && org) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: org, error: null }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found', code: 'PGRST116' },
              }),
            }),
          }),
        },
      );
    }
  }

  // Helper to create a complete mock database setup
  static createMockDatabaseSetup() {
    return {
      qrCodes: testQrCodes,
      users: testUsers,
      organizations: testOrganizations,
    };
  }
}

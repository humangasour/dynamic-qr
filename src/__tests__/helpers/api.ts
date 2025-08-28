import type { SupabaseClient } from '@supabase/supabase-js';

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
    ).mockResolvedValue({
      data,
      error: null,
    });
  }

  static mockHandleRedirectError(
    mockClient: SupabaseClient<Database>,
    errorMessage: string = 'Test error',
    errorCode: string = 'TEST_ERROR',
  ) {
    (
      mockClient.rpc as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue({
      data: null,
      error: { message: errorMessage, code: errorCode },
    });
  }

  // Helper to create mock API responses
  static createMockApiResponse<T>(
    data: T,
    error: { message: string; code?: string } | null = null,
  ) {
    return {
      data,
      error,
    };
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

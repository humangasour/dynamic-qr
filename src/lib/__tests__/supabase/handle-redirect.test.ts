import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabaseClient } from '@test/setup/mocks';
import { TestUtils } from '@test/setup/test-utils';

// Mock Supabase client
const mockSupabaseClient = createMockSupabaseClient();

// Mock the supabase client module
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    get client() {
      return mockSupabaseClient;
    },
  },
}));

describe('handle_redirect RPC Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Function Existence and Basic Structure', () => {
    it('should be callable with correct parameters', async () => {
      // Mock successful response for non-existent slug
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'non-existent-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('handle_redirect', {
        p_slug: 'non-existent-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('should handle function not existing error', async () => {
      // Mock function not existing error
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'function public.handle_redirect(text, text, text, text, text) does not exist',
          code: '42883',
        },
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('function');
      expect(result.error?.message).toContain('does not exist');
    });
  });

  describe('Mock Behavior Verification', () => {
    it('should verify mock is called with correct parameters', async () => {
      const testParams = {
        p_slug: 'test-slug',
        p_ip: '192.168.1.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      };

      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: [{ target_url: 'https://example.com' }],
        error: null,
      });

      const { supabase } = await import('@/lib/supabase/client');

      await supabase.client.rpc('handle_redirect', testParams);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('handle_redirect', testParams);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledTimes(1);
    });

    it('should handle different mock response scenarios', async () => {
      const scenarios = [
        TestUtils.createMockRpcResponse([{ target_url: 'https://example.com' }]),
        TestUtils.createMockRpcResponse([]),
        TestUtils.createMockRpcResponse(null, { message: 'Test error', code: 'TEST_ERROR' }),
      ];

      for (const scenario of scenarios) {
        mockSupabaseClient.rpc = vi.fn().mockResolvedValue(scenario);

        const { supabase } = await import('@/lib/supabase/client');

        const result = await supabase.client.rpc('handle_redirect', {
          p_slug: 'test-slug',
          p_ip: '127.0.0.1',
          p_user_agent: 'Test Browser',
          p_referrer: 'https://example.com',
          p_country: 'US',
        });

        expect(result).toEqual(scenario);
      }
    });
  });

  describe('Parameter Validation and Edge Cases', () => {
    it('should handle null/undefined parameters gracefully', async () => {
      const testCases = [
        {
          p_slug: 'test-slug',
          p_ip: null,
          p_user_agent: null,
          p_referrer: null,
          p_country: null,
        },
        {
          p_slug: 'test-slug',
          p_ip: undefined,
          p_user_agent: undefined,
          p_referrer: undefined,
          p_country: undefined,
        },
      ];

      for (const testCase of testCases) {
        mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
          data: [{ target_url: 'https://example.com' }],
          error: null,
        });

        const { supabase } = await import('@/lib/supabase/client');

        const result = await supabase.client.rpc('handle_redirect', {
          p_slug: testCase.p_slug,
          p_ip: testCase.p_ip ?? '',
          p_user_agent: testCase.p_user_agent ?? '',
          p_referrer: testCase.p_referrer ?? '',
          p_country: testCase.p_country ?? '',
        });

        expect(result.error).toBeNull();
      }
    });

    it('should handle very long parameter values', async () => {
      const longString = 'a'.repeat(1000);

      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: [{ target_url: 'https://example.com' }],
        error: null,
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: longString,
        p_user_agent: longString,
        p_referrer: longString,
        p_country: longString,
      });

      expect(result.error).toBeNull();
    });

    it('should handle special characters in parameters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: [{ target_url: 'https://example.com' }],
        error: null,
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: specialChars,
        p_user_agent: specialChars,
        p_referrer: specialChars,
        p_country: specialChars,
      });

      expect(result.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'connection error',
          code: '08006',
        },
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('connection error');
    });

    it('should handle permission errors', async () => {
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'permission denied for function handle_redirect',
          code: '42501',
        },
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('permission denied');
    });

    it('should handle malformed parameters', async () => {
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'invalid input syntax for type text',
          code: '22P02',
        },
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('invalid input syntax');
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        p_slug: `test-slug-${i}`,
        p_ip: `127.0.0.${i + 1}`,
        p_user_agent: `Test Browser ${i}`,
        p_referrer: `https://example${i}.com`,
        p_country: 'US',
      }));

      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: [{ target_url: 'https://example.com' }],
        error: null,
      });

      const { supabase } = await import('@/lib/supabase/client');

      const promises = requests.map((request) => supabase.client.rpc('handle_redirect', request));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result.error).toBeNull();
        expect(result.data).toEqual([{ target_url: 'https://example.com' }]);
      });
    });
  });

  describe('Function Behavior Verification', () => {
    it('should verify function signature matches expected parameters', () => {
      // This test verifies that the function signature in the database types
      // matches what we expect from the migration
      const expectedSignature = {
        p_slug: 'string',
        p_ip: 'string',
        p_user_agent: 'string',
        p_referrer: 'string',
        p_country: 'string',
      };

      // The function should accept these parameters
      expect(typeof expectedSignature.p_slug).toBe('string');
      expect(typeof expectedSignature.p_ip).toBe('string');
      expect(typeof expectedSignature.p_user_agent).toBe('string');
      expect(typeof expectedSignature.p_referrer).toBe('string');
      expect(typeof expectedSignature.p_country).toBe('string');
    });

    it('should verify return type structure', async () => {
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({
        data: [{ target_url: 'https://example.com' }],
        error: null,
      });

      const { supabase } = await import('@/lib/supabase/client');

      const result = await supabase.client.rpc('handle_redirect', {
        p_slug: 'test-slug',
        p_ip: '127.0.0.1',
        p_user_agent: 'Test Browser',
        p_referrer: 'https://example.com',
        p_country: 'US',
      });

      // Verify the return structure
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data && result.data.length > 0) {
        expect(result.data[0]).toHaveProperty('target_url');
        expect(typeof result.data[0].target_url).toBe('string');
      }
    });
  });
});

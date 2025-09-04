import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppRouter } from '@infra/trpc/root';

type Ctx = Parameters<AppRouter['createCaller']>[0];

function createCtx(overrides?: { rpc?: (fn: string, args: unknown) => Promise<unknown> }): Ctx {
  const supabase = {
    rpc: vi.fn(overrides?.rpc),
  } as unknown as Ctx;

  return { supabase } as unknown as Ctx;
}

describe('Redirect router (tRPC) integration', () => {
  let appRouter: (typeof import('@infra/trpc/root'))['appRouter'];

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({ appRouter } = await import('@infra/trpc/root'));
  });

  describe('Successful Redirects', () => {
    it('returns targetUrl when RPC finds a match', async () => {
      const ctx = createCtx({
        rpc: async (fn, args) => {
          expect(fn).toBe('handle_redirect');
          expect(args).toMatchObject({
            p_slug: 'test-slug',
            p_ip: '',
            p_user_agent: 'Integration Test Browser',
            p_referrer: 'https://example.com',
            p_country: '',
          });
          return { data: [{ target_url: 'https://example.com/test-target' }], error: null };
        },
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.public.redirect.handle({
        slug: 'test-slug',
        ip: undefined,
        userAgent: 'Integration Test Browser',
        referrer: 'https://example.com',
        country: undefined,
      });

      expect(result).toEqual({
        success: true,
        targetUrl: 'https://example.com/test-target',
        slug: 'test-slug',
      });
    });

    it('returns null targetUrl when no match found', async () => {
      const ctx = createCtx({ rpc: async () => ({ data: [], error: null }) });
      const caller = appRouter.createCaller(ctx);
      const result = await caller.public.redirect.handle({
        slug: 'missing-slug',
        ip: undefined,
        userAgent: undefined,
        referrer: undefined,
        country: undefined,
      });
      expect(result).toEqual({ success: true, targetUrl: null, slug: 'missing-slug' });
    });
  });

  describe('Error Handling', () => {
    it('throws when RPC returns an error', async () => {
      const ctx = createCtx({ rpc: async () => ({ data: null, error: { message: 'DB error' } }) });
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.public.redirect.handle({
          slug: 'any',
          ip: undefined,
          userAgent: undefined,
          referrer: undefined,
          country: undefined,
        }),
      ).rejects.toThrow(/Failed to process redirect: DB error/);
    });
  });

  describe('Performance and Concurrency', () => {
    it('handles multiple concurrent calls', async () => {
      const ctx = createCtx({
        rpc: async () => ({ data: [{ target_url: 'https://example.com/target' }], error: null }),
      });
      const caller = appRouter.createCaller(ctx);

      const requests = Array.from({ length: 5 }, (_, i) =>
        caller.public.redirect.handle({
          slug: `slug-${i}`,
          ip: `127.0.0.${i + 1}`,
          userAgent: `Concurrent Test Browser ${i}`,
          referrer: `https://example${i}.com`,
          country: 'US',
        }),
      );

      const results = await Promise.all(requests);
      expect(results).toHaveLength(5);
      results.forEach((r, i) => {
        expect(r.success).toBe(true);
        expect(r.targetUrl).toBe('https://example.com/target');
        expect(r.slug).toBe(`slug-${i}`);
      });
    });
  });
});

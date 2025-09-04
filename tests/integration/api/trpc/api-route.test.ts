import { describe, expect, it } from 'vitest';

describe('tRPC API Route', () => {
  it('should export route handlers', async () => {
    // Import the route handler
    const { GET, POST } = await import('@/app/api/trpc/[trpc]/route');

    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });

  it('should have tRPC context creation function', async () => {
    const { createTRPCContext } = await import('@infra/trpc/trpc');

    expect(createTRPCContext).toBeDefined();
    expect(typeof createTRPCContext).toBe('function');
  });

  it('should have app router defined', async () => {
    const { appRouter } = await import('@infra/trpc/root');

    expect(appRouter).toBeDefined();
    expect(appRouter.public).toBeDefined();
    expect(appRouter.public.redirect).toBeDefined();
    expect(appRouter.public.redirect.handle).toBeDefined();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppRouter } from '@infra/trpc/root';

type Ctx = Parameters<AppRouter['createCaller']>[0];

function createCtx(opts?: { user?: { id: string; email: string } }): Ctx {
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: opts?.user ?? null }, error: null })),
    },
  } as unknown as Ctx;

  return { supabase } as unknown as Ctx;
}

describe('tRPC auth router', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('rejects ensureUserAndOrg when unauthenticated', async () => {
    const { appRouter } = await import('@infra/trpc/root');
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.auth.ensureUserAndOrg({})).rejects.toThrow(/UNAUTHORIZED/);
  });
});

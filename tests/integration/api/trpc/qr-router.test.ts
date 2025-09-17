import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppRouter } from '@infra/trpc/root';

type Ctx = Parameters<AppRouter['createCaller']>[0];

interface QrRowSubset {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  current_target_url: string;
  svg_path: string | null;
  png_path: string | null;
  status: string;
}

function createCtx(opts?: {
  user?: { id: string; email: string } | null;
  qrRow?: QrRowSubset | null;
  isMember?: boolean;
  uploadError?: boolean;
  uniqueViolationOnce?: boolean;
  updateError?: boolean;
  versionInsertError?: boolean;
}): Ctx {
  const isMember = opts?.isMember ?? true;
  const defaultQrRow = {
    id: 'qr-1',
    org_id: 'org-1',
    name: 'QR One',
    slug: 'slug-one',
    current_target_url: 'https://example.com',
    svg_path: null,
    png_path: null,
    status: 'active',
  } as const;
  const qrRow = opts?.qrRow !== undefined ? opts.qrRow : defaultQrRow;

  // State for create mutation insert behavior
  let insertCall = 0;

  const supabase = {
    auth: {
      getUser: vi.fn(async () => {
        const currentUser =
          opts && 'user' in opts
            ? opts.user
            : ({ id: 'user-1', email: 'user@example.com' } as const);
        return {
          data: { user: currentUser },
          error: currentUser ? null : { message: 'not authenticated' },
        };
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'qr_codes') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: qrRow,
                error: qrRow === null ? { message: 'missing' } : null,
              })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => {
                insertCall += 1;
                if (opts?.uniqueViolationOnce && insertCall === 1) {
                  return {
                    data: null,
                    error: { code: '23505', message: 'unique violation on slug' },
                  } as unknown as { data: null; error: { code: string; message: string } };
                }
                return { data: { id: 'qr-created' }, error: null } as unknown as {
                  data: { id: string };
                  error: null;
                };
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(
              async () =>
                ({ error: opts?.updateError ? { message: 'update failed' } : null }) as const,
            ),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null }) as const),
          })),
        } as unknown as Record<string, unknown>;
      }
      if (table === 'org_members') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string) => {
              // Handle different query patterns
              if (field === 'user_id') {
                // Create flow: .select('org_id').eq('user_id', userId).single()
                return {
                  single: vi.fn(async () => ({
                    data: isMember ? { org_id: 'org-1' } : null,
                    error: isMember ? null : { message: 'no member' },
                  })),
                };
              } else if (field === 'org_id') {
                // GetById flow: .select('org_id').eq('org_id', qr.org_id).eq('user_id', userId).single()
                return {
                  eq: vi.fn(() => ({
                    single: vi.fn(async () => ({
                      data: isMember ? { org_id: 'org-1' } : null,
                      error: isMember ? null : { message: 'no member' },
                    })),
                  })),
                };
              }
              return {
                single: vi.fn(async () => ({
                  data: isMember ? { org_id: 'org-1' } : null,
                  error: isMember ? null : { message: 'no member' },
                })),
              };
            }),
          })),
        } as unknown as Record<string, unknown>;
      }
      if (table === 'qr_versions') {
        return {
          insert: vi.fn(async () => ({
            data: {},
            error: opts?.versionInsertError ? { message: 'insert failed' } : null,
          })),
        } as unknown as Record<string, unknown>;
      }
      return {} as Record<string, unknown>;
    }),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://cdn/qr-codes/${path}` },
        })),
        upload: vi.fn(async () => ({
          data: {},
          error: opts?.uploadError ? { message: 'upload failed' } : null,
        })),
      })),
    },
  } as unknown as Ctx;

  return { supabase } as unknown as Ctx;
}

describe('QR router (tRPC) integration', () => {
  let appRouter: (typeof import('@infra/trpc/root'))['appRouter'];

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({ appRouter } = await import('@infra/trpc/root'));
  });

  describe('getById', () => {
    it('returns QR details with computed asset URLs', async () => {
      const caller = appRouter.createCaller(createCtx());
      const result = await caller.qr.getById({ id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(result).toMatchObject({
        id: 'qr-1',
        name: 'QR One',
        targetUrl: 'https://example.com',
        slug: 'slug-one',
      });
      expect(result.svgUrl).toContain('/qr-codes/org-1/qr-1.svg');
      expect(result.pngUrl).toContain('/qr-codes/org-1/qr-1.png');
    });

    it('throws NOT_FOUND when QR does not exist', async () => {
      const ctx = createCtx({ qrRow: null });
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.qr.getById({ id: '550e8400-e29b-41d4-a716-446655440000' }),
      ).rejects.toThrow(/QR code not found/);
    });

    it('throws UNAUTHORIZED when user not a member of org', async () => {
      const ctx = createCtx({ isMember: false });
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.qr.getById({ id: '550e8400-e29b-41d4-a716-446655440000' }),
      ).rejects.toThrow(/UNAUTHORIZED|Access denied/i);
    });
  });

  describe('create', () => {
    it('creates a QR successfully and returns asset URLs', async () => {
      const caller = appRouter.createCaller(createCtx());
      const result = await caller.qr.create({ name: 'Hello', targetUrl: 'https://example.com' });
      expect(result.success).toBe(true);
      expect(result.id).toBe('qr-created');
      expect(result.slug).toBeTypeOf('string');
      expect(result.versionCount).toBe(1);
      expect(result.svgUrl).toContain('/qr-codes/');
      expect(result.pngUrl).toContain('/qr-codes/');
    });

    it('retries slug on unique violation and succeeds', async () => {
      const caller = appRouter.createCaller(createCtx({ uniqueViolationOnce: true }));
      const result = await caller.qr.create({ name: 'Hello', targetUrl: 'https://example.com' });
      expect(result.success).toBe(true);
      expect(result.id).toBe('qr-created');
      expect(result.versionCount).toBe(1);
    });

    it('cleans up and throws if asset upload fails', async () => {
      const caller = appRouter.createCaller(createCtx({ uploadError: true }));
      await expect(
        caller.qr.create({ name: 'X', targetUrl: 'https://example.com' }),
      ).rejects.toThrow(/Failed to upload QR code assets/);
    });

    it('succeeds even if updating asset paths fails (logs only)', async () => {
      const caller = appRouter.createCaller(createCtx({ updateError: true }));
      const result = await caller.qr.create({ name: 'Hello', targetUrl: 'https://example.com' });
      expect(result.success).toBe(true);
      expect(result.id).toBe('qr-created');
      expect(result.slug).toBeTypeOf('string');
      expect(result.versionCount).toBe(1);
      expect(result.svgUrl).toContain('/qr-codes/');
      expect(result.pngUrl).toContain('/qr-codes/');
    });

    it('rejects when unauthenticated', async () => {
      const ctx = createCtx({ user: null });
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.qr.create({ name: 'X', targetUrl: 'https://example.com' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    });
  });

  describe('list', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    it('returns first page with totals and nextCursor', async () => {
      const { createAuthedCtxWithQrList } = await import('@test/utils/trpc');
      const { makeCursor } = await import('@test/utils/cursor');
      const caller = appRouter.createCaller(createAuthedCtxWithQrList());
      const res = await caller.qr.list({ limit: 2, cursor: null });

      expect(res.totalCount).toBe(3);
      expect(res.items).toHaveLength(2);
      // Sorted by updated_at desc then id desc
      expect(res.items[0]).toMatchObject({ id: 'qr-3', slug: 'third' });
      expect(res.items[1]).toMatchObject({ id: 'qr-2', slug: 'second' });
      // Computed fields
      expect(res.items[0].svgUrl).toContain('/qr-codes/org-1/qr-3.svg');
      expect(res.items[0].versionCount).toBe(2);
      expect(res.items[1].versionCount).toBe(1);
      expect(res.items[0].weekScans).toBe(5);

      // nextCursor should point at the last visible item
      expect(res.nextCursor).toBe(makeCursor('2024-09-10T11:00:00.000Z', 'qr-2'));
    });

    it('applies cursor to fetch the next page', async () => {
      const { createAuthedCtxWithQrList } = await import('@test/utils/trpc');
      const caller = appRouter.createCaller(createAuthedCtxWithQrList());
      const first = await caller.qr.list({ limit: 2, cursor: null });
      expect(first.items).toHaveLength(2);
      const second = await caller.qr.list({ limit: 2, cursor: first.nextCursor });
      expect(second.items).toHaveLength(1);
      expect(second.items[0].id).toBe('qr-1');
      expect(second.nextCursor).toBeNull();
    });

    afterAll(() => warnSpy.mockRestore());
  });
});

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

interface VersionRow {
  id: string;
  qr_id: string;
  target_url: string;
  note: string | null;
  created_by: string;
  created_at: string;
}

interface CreateCtxOptions {
  user?: { id: string; email: string } | null;
  qrRow?: QrRowSubset | null;
  isMember?: boolean;
  uploadError?: boolean;
  uniqueViolationOnce?: boolean;
  updateError?: boolean;
  versionInsertError?: boolean;
  versions?: VersionRow[];
}

interface SupabaseMockHandles {
  qrCodesUpdate: ReturnType<typeof vi.fn>;
  qrCodesUpdateEq: ReturnType<typeof vi.fn>;
  qrVersionsInsert: ReturnType<typeof vi.fn>;
  qrVersionsSelect: ReturnType<typeof vi.fn>;
  versionRows: VersionRow[];
}

const mockRegistry = new WeakMap<object, SupabaseMockHandles>();

function createCtx(opts?: CreateCtxOptions): Ctx {
  const isMember = opts?.isMember ?? true;
  const defaultQrRow = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    org_id: 'org-1',
    name: 'QR One',
    slug: 'slug-one',
    current_target_url: 'https://example.com',
    svg_path: null,
    png_path: null,
    status: 'active',
  } as const;
  const qrRow = opts?.qrRow === undefined ? defaultQrRow : opts.qrRow;

  const defaultVersions =
    qrRow && 'id' in qrRow
      ? [
          {
            id: '660e8400-e29b-41d4-a716-446655440000',
            qr_id: qrRow.id,
            target_url: qrRow.current_target_url,
            note: 'Initial version',
            created_by: '760e8400-e29b-41d4-a716-446655440000',
            created_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: '770e8400-e29b-41d4-a716-446655440000',
            qr_id: qrRow.id,
            target_url: `${qrRow.current_target_url}/v2`,
            note: null,
            created_by: '760e8400-e29b-41d4-a716-446655440000',
            created_at: '2024-01-02T00:00:00.000Z',
          },
        ]
      : [];
  const versionRows = [...(opts?.versions ?? defaultVersions)];

  // State for create mutation insert behavior
  let insertCall = 0;

  const getUser = vi.fn(async () => {
    const currentUser =
      opts && 'user' in opts ? opts.user : ({ id: 'user-1', email: 'user@example.com' } as const);
    return {
      data: { user: currentUser },
      error: currentUser ? null : { message: 'not authenticated' },
    };
  });

  function buildQrCodesListQuery(
    rows: Array<
      Required<
        Pick<QrRowSubset, 'id' | 'org_id' | 'name' | 'slug' | 'current_target_url' | 'svg_path'>
      > & { updated_at: string }
    >,
  ) {
    let working = [...rows];
    const total = rows.length;
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn((col: string, val: string) => {
        if (col === 'org_id') working = working.filter((r) => r.org_id === val);
        return chain;
      }),
      order: vi.fn((col: 'updated_at' | 'id', opts?: { ascending?: boolean }) => {
        const asc = opts?.ascending ?? true;
        working = working.sort((a, b) => {
          if (col === 'updated_at') {
            const aT = +new Date((a as { updated_at: string }).updated_at);
            const bT = +new Date((b as { updated_at: string }).updated_at);
            return asc ? aT - bT : bT - aT;
          }
          return asc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        });
        return chain;
      }),
      or: vi.fn((expr: string) => {
        try {
          const [ltPart, andPart] = expr.split(',');
          const ts = ltPart.split('.').slice(2).join('.');
          const id = andPart.split('id.lt.').slice(-1)[0]?.replace(/\)$/g, '');
          working = working.filter((r) => {
            const rT = +new Date((r as { updated_at: string }).updated_at);
            const cT = +new Date(ts);
            return rT < cT || ((r as { updated_at: string }).updated_at === ts && r.id < id);
          });
        } catch {}
        return chain;
      }),
      limit: vi.fn(async (n: number) => ({ data: working.slice(0, n), error: null, count: total })),
    } as const;
    return chain;
  }

  const listRows =
    opts?.qrRow == null
      ? []
      : [
          {
            id: qrRow!.id,
            org_id: qrRow!.org_id,
            name: qrRow!.name,
            slug: qrRow!.slug,
            current_target_url: qrRow!.current_target_url,
            svg_path: qrRow!.svg_path,
            updated_at: '2024-09-10T12:00:00.000Z',
          },
        ];

  const qrCodesSelect = vi.fn((cols: string) => {
    if (cols.includes('updated_at')) {
      return buildQrCodesListQuery(listRows);
    }
    return {
      eq: vi.fn(() => ({
        single: vi.fn(async () => ({
          data: qrRow,
          error: qrRow === null ? { message: 'missing' } : null,
        })),
      })),
    } as unknown as Record<string, unknown>;
  });

  const qrCodesInsertSingle = vi.fn(async () => {
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
  });

  const qrCodesInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: qrCodesInsertSingle })) }));

  const qrCodesUpdateEq = vi.fn(async (column: string, value: string) => {
    void column;
    void value;
    return {
      error: opts?.updateError ? { message: 'update failed' } : null,
    } as const;
  });
  const qrCodesUpdate = vi.fn((payload: Record<string, unknown>) => {
    void payload;
    return { eq: qrCodesUpdateEq };
  });

  const qrCodesDelete = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }));

  const orgMembersSelect = vi.fn(() => ({
    eq: vi.fn((field: string) => {
      if (field === 'user_id') {
        return {
          single: vi.fn(async () => ({
            data: isMember ? { org_id: 'org-1' } : null,
            error: isMember ? null : { message: 'no member' },
          })),
        };
      }
      return {
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: isMember ? { org_id: 'org-1' } : null,
            error: isMember ? null : { message: 'no member' },
          })),
        })),
      };
    }),
  }));

  const qrVersionsInsert = vi.fn(async (payload: VersionRow | { [key: string]: unknown }) => {
    void payload;
    return {
      data: {},
      error: opts?.versionInsertError ? { message: 'insert failed' } : null,
    };
  });

  const qrVersionsSelect = vi.fn(() => {
    let working = [...versionRows];
    const chain = {
      eq: vi.fn((column: string, value: string) => {
        if (column === 'qr_id') {
          working = working.filter((v) => v.qr_id === value);
        } else if (column === 'id') {
          working = working.filter((v) => v.id === value);
        }
        return chain;
      }),
      order: vi.fn(async (column: string, options?: { ascending?: boolean }) => {
        if (column === 'created_at') {
          working = working.sort((a, b) => {
            const aT = +new Date(a.created_at);
            const bT = +new Date(b.created_at);
            return options?.ascending === false ? bT - aT : aT - bT;
          });
        }
        return { data: working, error: null };
      }),
      single: vi.fn(async () => {
        if (working.length === 0) {
          return { data: null, error: { message: 'not found' } };
        }
        return { data: working[0], error: null };
      }),
    } as const;
    return chain;
  });

  const supabase = {
    auth: {
      getUser,
    },
    from: vi.fn((table: string) => {
      if (table === 'qr_codes') {
        return {
          select: qrCodesSelect,
          insert: qrCodesInsert,
          update: qrCodesUpdate,
          delete: qrCodesDelete,
        } as unknown as Record<string, unknown>;
      }
      if (table === 'org_members') {
        return { select: orgMembersSelect } as unknown as Record<string, unknown>;
      }
      if (table === 'qr_versions') {
        return {
          insert: qrVersionsInsert,
          select: qrVersionsSelect,
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

  const ctx = { supabase } as Record<string, unknown>;
  const mocks: SupabaseMockHandles = {
    qrCodesUpdate,
    qrCodesUpdateEq,
    qrVersionsInsert,
    qrVersionsSelect,
    versionRows,
  };
  mockRegistry.set(ctx, mocks);

  return ctx as unknown as Ctx;
}

function getCtxMocks(ctx: Ctx): SupabaseMockHandles {
  const mocks = mockRegistry.get(ctx as unknown as object);
  if (!mocks) {
    throw new Error('Test context mocks not found');
  }
  return mocks;
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
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'QR One',
        targetUrl: 'https://example.com',
        slug: 'slug-one',
      });
      expect(result.svgUrl).toContain('/qr-codes/org-1/550e8400-e29b-41d4-a716-446655440000.svg');
      expect(result.pngUrl).toContain('/qr-codes/org-1/550e8400-e29b-41d4-a716-446655440000.png');
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

  describe('update', () => {
    it('updates QR metadata and records a version note', async () => {
      const ctx = createCtx();
      const caller = appRouter.createCaller(ctx);

      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Renamed QR',
        targetUrl: 'https://example.com/new-target',
        note: 'Promo campaign',
      } as const;

      const result = await caller.qr.update(payload);

      expect(result).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Renamed QR',
        targetUrl: 'https://example.com/new-target',
        slug: 'slug-one',
      });
      expect(result.svgUrl).toContain('/qr-codes/org-1/550e8400-e29b-41d4-a716-446655440000.svg');

      const mocks = getCtxMocks(ctx);
      expect(mocks.qrCodesUpdate).toHaveBeenCalledWith({
        current_target_url: payload.targetUrl,
        name: payload.name,
      });
      expect(mocks.qrCodesUpdateEq).toHaveBeenCalledWith('id', payload.id);
      expect(mocks.qrVersionsInsert).toHaveBeenCalledWith({
        qr_id: payload.id,
        target_url: payload.targetUrl,
        note: payload.note,
        created_by: 'user-1',
      });
    });
  });

  describe('versions', () => {
    it('lists QR versions in reverse chronological order', async () => {
      const versions = [
        {
          id: '770e8400-e29b-41d4-a716-446655440111',
          qr_id: '550e8400-e29b-41d4-a716-446655440000',
          target_url: 'https://example.com/older',
          note: 'Older',
          created_by: '880e8400-e29b-41d4-a716-446655440000',
          created_at: '2024-01-01T12:00:00.000Z',
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440222',
          qr_id: '550e8400-e29b-41d4-a716-446655440000',
          target_url: 'https://example.com/newer',
          note: null,
          created_by: '880e8400-e29b-41d4-a716-446655440000',
          created_at: '2024-02-01T12:00:00.000Z',
        },
      ];

      const caller = appRouter.createCaller(createCtx({ versions }));
      const result = await caller.qr.versions({ id: '550e8400-e29b-41d4-a716-446655440000' });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '770e8400-e29b-41d4-a716-446655440222',
        qrId: '550e8400-e29b-41d4-a716-446655440000',
        targetUrl: 'https://example.com/newer',
        note: null,
        createdBy: '880e8400-e29b-41d4-a716-446655440000',
      });
      expect(result[1].targetUrl).toBe('https://example.com/older');
    });
  });

  describe('rollback', () => {
    it('rolls back to a prior version and records the rollback', async () => {
      const version = {
        id: '770e8400-e29b-41d4-a716-446655440333',
        qr_id: '550e8400-e29b-41d4-a716-446655440000',
        target_url: 'https://example.com/previous',
        note: 'Previous target',
        created_by: '880e8400-e29b-41d4-a716-446655440000',
        created_at: '2024-01-01T12:00:00.000Z',
      } as const;

      const ctx = createCtx({ versions: [version] });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.qr.rollback({
        qrId: '550e8400-e29b-41d4-a716-446655440000',
        versionId: version.id,
      });

      expect(result).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        targetUrl: 'https://example.com/previous',
      });

      const mocks = getCtxMocks(ctx);
      expect(mocks.qrCodesUpdate).toHaveBeenCalledWith({ current_target_url: version.target_url });
      expect(mocks.qrCodesUpdateEq).toHaveBeenCalledWith(
        'id',
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(mocks.qrVersionsInsert).toHaveBeenCalledWith({
        qr_id: '550e8400-e29b-41d4-a716-446655440000',
        target_url: 'https://example.com/previous',
        note: `Rolled back to version ${version.id}`,
        created_by: 'user-1',
      });
    });
  });
});

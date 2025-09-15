import { vi } from 'vitest';

import type { AppRouter } from '@/infrastructure/trpc/root';

type Ctx = Parameters<AppRouter['createCaller']>[0];

export function createAuthedCtxWithQrList(opts?: {
  user?: { id: string; email: string } | null;
  isMember?: boolean;
  rows?: Array<{
    id: string;
    org_id: string;
    name: string;
    slug: string;
    current_target_url: string;
    svg_path: string | null;
    updated_at: string;
  }>;
  versionRows?: Array<{ qr_id: string }>;
  aggRows?: Array<{ qr_id: string; day: string; scans: number }>;
}): Ctx {
  const isMember = opts?.isMember ?? true;
  const rows = opts?.rows ?? [
    {
      id: 'qr-3',
      org_id: 'org-1',
      name: 'Third',
      slug: 'third',
      current_target_url: 'https://example.com/3',
      svg_path: null,
      updated_at: '2024-09-10T12:00:00.000Z',
    },
    {
      id: 'qr-2',
      org_id: 'org-1',
      name: 'Second',
      slug: 'second',
      current_target_url: 'https://example.com/2',
      svg_path: null,
      updated_at: '2024-09-10T11:00:00.000Z',
    },
    {
      id: 'qr-1',
      org_id: 'org-1',
      name: 'First',
      slug: 'first',
      current_target_url: 'https://example.com/1',
      svg_path: null,
      updated_at: '2024-09-10T10:00:00.000Z',
    },
  ];

  const versionRows = opts?.versionRows ?? [
    { qr_id: 'qr-3' },
    { qr_id: 'qr-3' },
    { qr_id: 'qr-2' },
  ];
  const aggRows = opts?.aggRows ?? [
    { qr_id: 'qr-3', day: '2024-09-09', scans: 5 },
    { qr_id: 'qr-2', day: '2024-09-09', scans: 3 },
    { qr_id: 'qr-2', day: '2024-09-08', scans: 2 },
  ];

  function buildQrCodesListQuery() {
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
            const aT = +new Date(a.updated_at);
            const bT = +new Date(b.updated_at);
            return asc ? aT - bT : bT - aT;
          }
          return asc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        });
        return chain;
      }),
      or: vi.fn((expr: string) => {
        try {
          const [ltPart, andPart] = expr.split(',');
          // Extract timestamp from "updated_at.lt.2024-09-10T11:00:00.000Z"
          const ts = ltPart.split('.').slice(2).join('.');
          // Extract id from "and(updated_at.eq.2024-09-10T11:00:00.000Z,id.lt.qr-2)"
          const id = andPart.split('id.lt.').slice(-1)[0]?.replace(/\)$/g, '');
          working = working.filter((r) => {
            const rT = +new Date(r.updated_at);
            const cT = +new Date(ts);
            return rT < cT || (r.updated_at === ts && r.id < id);
          });
        } catch {}
        return chain;
      }),
      limit: vi.fn(async (n: number) => ({ data: working.slice(0, n), error: null, count: total })),
    } as const;
    return chain;
  }

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
      if (table === 'org_members') {
        return {
          select: vi.fn(() => ({
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
          })),
        } as unknown as Record<string, unknown>;
      }
      if (table === 'qr_codes') {
        return {
          select: vi.fn((cols: string) => {
            if (cols.includes('updated_at')) return buildQrCodesListQuery();
            return {
              eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: rows[0], error: null })) })),
            } as unknown as Record<string, unknown>;
          }),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: { id: 'qr-created' }, error: null })),
            })),
          })),
          update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null }) as const) })),
          delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null }) as const) })),
        } as unknown as Record<string, unknown>;
      }
      if (table === 'qr_versions') {
        return {
          select: vi.fn(() => ({ in: vi.fn(async () => ({ data: versionRows, error: null })) })),
        } as unknown as Record<string, unknown>;
      }
      if (table === 'daily_aggregates') {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => ({ gte: vi.fn(async () => ({ data: aggRows, error: null })) })),
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
        upload: vi.fn(async () => ({ data: {}, error: null })),
      })),
    },
  } as unknown as Ctx;

  return { supabase } as unknown as Ctx;
}

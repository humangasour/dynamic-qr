import { describe, it, expect, vi, beforeEach } from 'vitest';

// Redirect mock (simple and synchronous)
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

// Minimal mutable Supabase mock
type VMock = ReturnType<typeof vi.fn>;
const mockClient: { auth: { getUser: VMock }; from: VMock; rpc: VMock } = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@infra/supabase/clients/server-client', () => ({
  getSupabaseServerClient: async () => mockClient,
}));

// Import after mocks
import * as authServer from '@/features/auth/server';

function buildOrgMemberChain(data: unknown) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({ data, error: null })),
          })),
        })),
      })),
    })),
  };
}

describe('Auth Server Guards & Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserId returns user id when user exists', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'uid-123' } }, error: null });
    const uid = await authServer.getUserId();
    expect(uid).toBe('uid-123');
  });

  it('getUserId returns null when no user', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const uid = await authServer.getUserId();
    expect(uid).toBeNull();
  });

  it('redirectIfUnauthenticated redirects to sign-in when no user', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(authServer.redirectIfUnauthenticated()).rejects.toThrow(
      /REDIRECT:\/auth\/sign-in/,
    );
  });

  it('redirectIfAuthenticated redirects to /app when user exists', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'uid-1' } }, error: null });
    mockClient.from.mockReturnValue(
      buildOrgMemberChain({
        role: 'owner',
        org: { id: 'org-1', name: 'Org' },
        user: { id: 'uid-1', email: 'u@example.com', name: 'U', avatar_url: null },
      }),
    );
    await expect(authServer.redirectIfAuthenticated()).rejects.toThrow(/REDIRECT:\/app/);
  });

  it('requireUserId returns id when authenticated', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'uid-9' } }, error: null });
    const uid = await authServer.requireUserId();
    expect(uid).toBe('uid-9');
  });

  it('requireCurrentUser returns user with org when authenticated', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'uid-1' } }, error: null });
    mockClient.from.mockReturnValue(
      buildOrgMemberChain({
        role: 'owner',
        org: { id: 'org-1', name: 'Org' },
        user: { id: 'uid-1', email: 'u@example.com', name: 'U', avatar_url: null },
      }),
    );
    const u = await authServer.requireCurrentUser();
    expect(u.org_id).toBe('org-1');
    expect(u.email).toBe('u@example.com');
  });

  it('hasOrgRole verifies role against required', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'uid-1' } }, error: null });
    mockClient.from.mockReturnValue(
      buildOrgMemberChain({
        role: 'editor',
        org: { id: 'org-2', name: 'Org' },
        user: { id: 'uid-1', email: 'u@example.com', name: 'U', avatar_url: null },
      }),
    );
    const ok = await authServer.hasOrgRole('org-2', 'viewer');
    const notOk = await authServer.hasOrgRole('org-2', 'owner');
    expect(ok).toBe(true);
    expect(notOk).toBe(false);
  });

  it('ensureUserAndOrg returns org id (mocked rpc)', async () => {
    mockClient.rpc.mockResolvedValue({ data: 'org-uuid-1', error: null });
    const orgId = await authServer.ensureUserAndOrg('uid-1', 'u@example.com', 'U');
    expect(orgId).toBe('org-uuid-1');
  });
});

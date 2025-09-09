/* eslint-disable import/order */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  createMockSupabaseClient,
  buildOrgMemberMaybeSingle,
  expectRedirect,
  asMock,
} from '@test/utils';

// Redirect mock (simple and synchronous)
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

// Locale mock used during redirects
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
}));
const mockClient = createMockSupabaseClient();

vi.mock('@infra/supabase/clients/server-client', () => ({
  getSupabaseServerClient: async () => mockClient,
}));

// Import after mocks
import * as authServer from '@/features/auth/server';

describe('Auth Server Guards & Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserId returns user id when user exists', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({
      data: { user: { id: 'uid-123' } },
      error: null,
    });
    const uid = await authServer.getUserId();
    expect(uid).toBe('uid-123');
  });

  it('getUserId returns null when no user', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
    const uid = await authServer.getUserId();
    expect(uid).toBeNull();
  });

  // Note: redirectIfUnauthenticated/redirectIfAuthenticated helpers were removed as unused.
  // Their behavior is covered by requireUserId/requireCurrentUser (redirects on unauthenticated).

  it('requireUserId returns id when authenticated', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({
      data: { user: { id: 'uid-9' } },
      error: null,
    });
    const uid = await authServer.requireUserId();
    expect(uid).toBe('uid-9');
  });

  it('requireUserId redirects when unauthenticated', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
    await expectRedirect(() => authServer.requireUserId(), '/en/sign-in');
  });

  it('requireCurrentUser returns user with org when authenticated', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({
      data: { user: { id: 'uid-1' } },
      error: null,
    });
    asMock(mockClient.from).mockReturnValue(
      buildOrgMemberMaybeSingle({
        role: 'owner',
        org: { id: 'org-1', name: 'Org' },
        user: { id: 'uid-1', email: 'u@example.com', name: 'U', avatar_url: null },
      }),
    );
    const u = await authServer.requireCurrentUser();
    expect(u.org_id).toBe('org-1');
    expect(u.email).toBe('u@example.com');
  });

  it('requireCurrentUser redirects when unauthenticated', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
    await expectRedirect(() => authServer.requireCurrentUser(), '/en/sign-in');
  });

  it('hasOrgRole verifies role against required', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({
      data: { user: { id: 'uid-1' } },
      error: null,
    });
    asMock(mockClient.from).mockReturnValue(
      buildOrgMemberMaybeSingle({
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

  it('getUserOrgId throws when unauthenticated', async () => {
    asMock(mockClient.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
    await expect(authServer.getUserOrgId()).rejects.toThrow('User not authenticated');
  });

  it('ensureUserAndOrg returns org id (mocked rpc)', async () => {
    asMock(mockClient.rpc).mockResolvedValue({ data: 'org-uuid-1', error: null });
    const orgId = await authServer.ensureUserAndOrg('uid-1', 'u@example.com', 'U');
    expect(orgId).toBe('org-uuid-1');
  });
});

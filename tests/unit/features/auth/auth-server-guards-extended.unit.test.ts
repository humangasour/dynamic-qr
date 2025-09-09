/* eslint-disable import/order */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError } from '@supabase/supabase-js';

import {
  createMockSupabaseClient,
  buildOrgMemberMaybeSingle,
  expectRedirect,
  asMock,
} from '@test/utils';

// Redirect mock
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

// Locale mock used during redirects
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
}));

// Supabase client mocks (read-write and read-only)
const mockRW = createMockSupabaseClient();
const mockRO = createMockSupabaseClient();

vi.mock('@infra/supabase/clients/server-client', () => ({
  getSupabaseServerClient: async () => mockRW,
  getSupabaseServerClientReadOnly: async () => mockRO ?? mockRW,
}));

// Import after mocks
import * as authServer from '@/features/auth/server';

describe('Auth Server - extended guards and helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSession', () => {
    it('returns session when present', async () => {
      const session = { access_token: 't' };
      asMock(mockRW.auth.getSession).mockResolvedValue({ data: { session }, error: null });
      await expect(authServer.getSession()).resolves.toBe(session);
    });

    it('returns null when no session', async () => {
      asMock(mockRW.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
      await expect(authServer.getSession()).resolves.toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no authenticated user', async () => {
      asMock(mockRW.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
      await expect(authServer.getCurrentUser()).resolves.toBeNull();
    });

    it('returns null and reports when org lookup fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      asMock(mockRW.auth.getUser).mockResolvedValue({ data: { user: { id: 'uid' } }, error: null });
      asMock(mockRW.from).mockReturnValue(buildOrgMemberMaybeSingle(null, { message: 'db error' }));
      await expect(authServer.getCurrentUser()).resolves.toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Server component variants (read-only client)', () => {
    it('getUserIdForServerComponent returns id when available', async () => {
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      await expect(authServer.getUserIdForServerComponent()).resolves.toBe('u1');
    });

    it('getUserIdForServerComponent returns null on AuthError refresh token issue', async () => {
      asMock(mockRO.auth.getUser).mockRejectedValue(new AuthError('refresh_token_not_found'));
      await expect(authServer.getUserIdForServerComponent()).resolves.toBeNull();
    });

    it('getUserIdForServerComponent rethrows unknown errors', async () => {
      asMock(mockRO.auth.getUser).mockRejectedValue(new Error('boom'));
      await expect(authServer.getUserIdForServerComponent()).rejects.toThrow('boom');
    });

    it('getCurrentUserForServerComponent returns null for unauthenticated', async () => {
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
      await expect(authServer.getCurrentUserForServerComponent()).resolves.toBeNull();
    });

    it('getCurrentUserForServerComponent returns a full user with org on success', async () => {
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: { id: 'u2' } }, error: null });
      asMock(mockRO.from).mockReturnValue(
        buildOrgMemberMaybeSingle({
          role: 'admin',
          org: { id: 'org-9', name: 'Acme' },
          user: { id: 'u2', email: 'u2@example.com', name: 'User Two', avatar_url: 'a.png' },
        }),
      );
      const u = await authServer.getCurrentUserForServerComponent();
      expect(u?.id).toBe('u2');
      expect(u?.org_id).toBe('org-9');
      expect(u?.org_role).toBe('admin');
    });

    it('getCurrentUserForServerComponent swallows AuthError and returns null', async () => {
      asMock(mockRO.auth.getUser).mockRejectedValue(new AuthError('refresh_token_not_found'));
      await expect(authServer.getCurrentUserForServerComponent()).resolves.toBeNull();
    });

    it('getCurrentUserForServerComponent returns null and reports when org lookup fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: { id: 'u2' } }, error: null });
      asMock(mockRO.from).mockReturnValue(buildOrgMemberMaybeSingle(null, { message: 'db fail' }));
      await expect(authServer.getCurrentUserForServerComponent()).resolves.toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('requireUserIdForServerComponent redirects when unauthenticated', async () => {
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
      await expectRedirect(() => authServer.requireUserIdForServerComponent(), '/en/sign-in');
    });

    it('requireCurrentUserForServerComponent redirects when unauthenticated', async () => {
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
      await expectRedirect(() => authServer.requireCurrentUserForServerComponent(), '/en/sign-in');
    });

    it('redirectIfAuthenticatedForServerComponent redirects to dashboard when authenticated', async () => {
      asMock(mockRO.auth.getUser).mockResolvedValue({ data: { user: { id: 'u3' } }, error: null });
      asMock(mockRO.from).mockReturnValue(
        buildOrgMemberMaybeSingle({
          role: 'viewer',
          org: { id: 'org-2', name: 'Org' },
          user: { id: 'u3', email: 'u3@example.com', name: 'U3', avatar_url: null },
        }),
      );
      await expectRedirect(
        () => authServer.redirectIfAuthenticatedForServerComponent(),
        '/en/dashboard',
      );
    });
  });

  describe('ensureUserAndOrg - failure paths', () => {
    it('reports and throws when RPC returns error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      asMock(mockRW.rpc).mockResolvedValue({ data: null, error: { message: 'rpc failed' } });
      await expect(authServer.ensureUserAndOrg('u', 'e@example.com', 'N')).rejects.toThrow(
        /Failed to ensure user and org/i,
      );
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('throws when RPC returns null org id without error', async () => {
      asMock(mockRW.rpc).mockResolvedValue({ data: null, error: null });
      await expect(authServer.ensureUserAndOrg('u', 'e@example.com')).rejects.toThrow(
        /null org ID/i,
      );
    });
  });
});

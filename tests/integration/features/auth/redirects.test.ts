import { describe, it, expect, vi } from 'vitest';

// Redirect mock (no generics, no async factory)
vi.mock('next/navigation', () => {
  return {
    redirect: (url: string) => {
      throw new Error(`REDIRECT:${url}`);
    },
  };
});

// Simple mutable mock client for Supabase server client
type VMock = ReturnType<typeof vi.fn>;
const mockClient: { auth: { getUser: VMock }; from: VMock } = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock('@infra/supabase/clients/server-client', () => {
  return {
    getSupabaseServerClient: async () => mockClient,
  };
});

// Import after mocks to ensure they take effect in module under test
import { redirectIfAuthenticated, redirectIfUnauthenticated } from '@/features/auth/server';

// Helper to build the select -> eq -> order -> limit -> maybeSingle chain
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

describe('Auth redirect helpers (integration)', () => {
  it('redirectIfUnauthenticated → /auth/sign-in when unauthenticated', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(redirectIfUnauthenticated()).rejects.toThrowError(/REDIRECT:\/auth\/sign-in/);
  });

  it('redirectIfAuthenticated → /app when authenticated', async () => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'uid-1' } }, error: null });
    mockClient.from.mockReturnValue(
      buildOrgMemberChain({
        role: 'owner',
        org: { id: 'org-1', name: 'Org' },
        user: { id: 'uid-1', email: 'u@example.com', name: 'U', avatar_url: null },
      }),
    );
    await expect(redirectIfAuthenticated()).rejects.toThrowError(/REDIRECT:\/app/);
  });
});

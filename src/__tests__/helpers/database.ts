import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

import type { Database } from '@/types';

import { testOrganizations, testQrCodes, testUsers } from '../fixtures';

// Database test helpers
export class DatabaseTestHelpers {
  static mockQrCodeQuery(
    mockClient: SupabaseClient<Database>,
    slug: string,
    shouldExist: boolean = true,
  ) {
    const qrCode = testQrCodes.find((qr) => qr.slug === slug);

    if (shouldExist && qrCode) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: qrCode,
                error: null,
              }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found', code: 'PGRST116' },
              }),
            }),
          }),
        },
      );
    }
  }

  static mockScanEventInsert(mockClient: SupabaseClient<Database>, shouldSucceed: boolean = true) {
    if (shouldSucceed) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 1 },
                error: null,
              }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Insert failed', code: 'PGRST301' },
              }),
            }),
          }),
        },
      );
    }
  }

  static mockUserQuery(
    mockClient: SupabaseClient<Database>,
    userId: string,
    shouldExist: boolean = true,
  ) {
    const user = testUsers.find((u) => u.id === userId);

    if (shouldExist && user) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: user,
                error: null,
              }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found', code: 'PGRST116' },
              }),
            }),
          }),
        },
      );
    }
  }

  static mockOrganizationQuery(
    mockClient: SupabaseClient<Database>,
    orgId: string,
    shouldExist: boolean = true,
  ) {
    const org = testOrganizations.find((o) => o.id === orgId);

    if (shouldExist && org) {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: org,
                error: null,
              }),
            }),
          }),
        },
      );
    } else {
      (mockClient.from as unknown as { mockReturnValue: (value: unknown) => void }).mockReturnValue(
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'No rows found', code: 'PGRST116' },
              }),
            }),
          }),
        },
      );
    }
  }

  // Helper to create a complete mock database setup
  static createMockDatabaseSetup() {
    return {
      qrCodes: testQrCodes,
      users: testUsers,
      organizations: testOrganizations,
    };
  }
}

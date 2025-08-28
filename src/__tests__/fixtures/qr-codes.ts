import type { Database } from '@/types';

type QrCode = Database['public']['Tables']['qr_codes']['Row'];

export const testQrCodes: QrCode[] = [
  {
    id: 'qr-001',
    org_id: 'org-001',
    name: 'Test QR Code 1',
    slug: 'test-qr-1',
    current_target_url: 'https://example.com/target1',
    status: 'active',
    created_by: 'user-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'qr-002',
    org_id: 'org-001',
    name: 'Test QR Code 2',
    slug: 'test-qr-2',
    current_target_url: 'https://example.com/target2',
    status: 'active',
    created_by: 'user-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'qr-003',
    org_id: 'org-001',
    name: 'Archived QR Code',
    slug: 'archived-qr',
    current_target_url: 'https://example.com/archived',
    status: 'archived',
    created_by: 'user-001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const getQrCodeBySlug = (slug: string): QrCode | undefined => {
  return testQrCodes.find((qr) => qr.slug === slug);
};

export const getActiveQrCodes = (): QrCode[] => {
  return testQrCodes.filter((qr) => qr.status === 'active');
};

export const getArchivedQrCodes = (): QrCode[] => {
  return testQrCodes.filter((qr) => qr.status === 'archived');
};

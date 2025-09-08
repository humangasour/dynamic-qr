import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = {
  title: 'QR Codes | Dynamic QR',
  description: 'Browse and manage your QR codes',
};

export default async function QrIndexPage() {
  await requireUserIdForServerComponent();

  return (
    <main>
      <ComingSoon
        title="Your QR Codes"
        description="We’re building the list view. In the meantime, you can create a new dynamic QR and start using it right away."
        cta={{ href: '/qr/new', label: 'Create New QR Code' }}
      />
    </main>
  );
}

import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = {
  title: 'Settings | Dynamic QR',
  description: 'Manage your account and workspace settings',
};

export default async function SettingsIndexPage() {
  await requireUserIdForServerComponent();

  return (
    <main>
      <ComingSoon
        title="Settings"
        description="Manage your profile, organization, and billing. Sections are being built out."
      />
    </main>
  );
}

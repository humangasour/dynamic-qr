import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = {
  title: 'Profile Settings | Dynamic QR',
  description: 'Update your account profile',
};

export default async function ProfileSettingsPage() {
  await requireUserIdForServerComponent();

  return (
    <main>
      <ComingSoon
        title="Profile Settings"
        description="Update your name, email, and personal preferences."
      />
    </main>
  );
}

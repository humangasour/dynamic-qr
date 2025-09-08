import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = {
  title: 'Billing Settings | Dynamic QR',
  description: 'Manage your subscription and invoices',
};

export default async function BillingSettingsPage() {
  await requireUserIdForServerComponent();

  return (
    <main>
      <ComingSoon title="Billing" description="Manage your plan, payment method, and invoices." />
    </main>
  );
}

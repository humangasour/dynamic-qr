import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export const metadata: Metadata = {
  title: 'Analytics | Dynamic QR',
  description: 'View scan analytics and insights',
};

export default async function AnalyticsPage() {
  await requireUserIdForServerComponent();

  return (
    <main>
      <ComingSoon
        title="Analytics"
        description="Track total scans, daily activity, and top sources. We’re polishing the dashboards and charts."
      />
    </main>
  );
}

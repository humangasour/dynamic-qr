import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('analytics.page');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AnalyticsPage() {
  await requireUserIdForServerComponent();
  const t = await getTranslations();

  return (
    <main>
      <ComingSoon title={t('analytics.page.title')} description={t('analytics.page.description')} />
    </main>
  );
}

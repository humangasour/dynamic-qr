import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('settings.page');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SettingsIndexPage() {
  await requireUserIdForServerComponent();
  const t = await getTranslations();

  return (
    <main>
      <ComingSoon title={t('settings.page.title')} description={t('settings.page.description')} />
    </main>
  );
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('settings.profile.page');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProfileSettingsPage() {
  await requireUserIdForServerComponent();
  const t = await getTranslations();

  return (
    <main>
      <ComingSoon
        title={t('settings.profile.page.title')}
        description={t('settings.profile.page.description')}
      />
    </main>
  );
}

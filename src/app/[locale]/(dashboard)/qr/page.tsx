import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { ComingSoon } from '@/components/layout/ComingSoon';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qr.page.index');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function QrIndexPage() {
  await requireUserIdForServerComponent();
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <main>
      <ComingSoon
        title={t('qr.page.index.title')}
        description={t('qr.page.index.description')}
        cta={{ href: `/${locale}/qr/new`, label: t('qr.page.index.createCta') }}
      />
    </main>
  );
}

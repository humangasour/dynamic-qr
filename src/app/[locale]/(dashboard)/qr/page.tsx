import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/ui/button';
import { QrListClient } from '@/components/qr/QrListClient';
import { getTrpcCallerReadOnly } from '@/infrastructure/trpc/server-caller';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qr.page.index');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function QrIndexPage() {
  await requireUserIdForServerComponent();
  const t = await getTranslations('qr.page.index');
  const locale = await getLocale();
  const PAGE_SIZE = 2;

  // SSR: fetch first page (10 items) and pass as initial data
  const caller = await getTrpcCallerReadOnly();
  const initialPage = await caller.qr.list({ limit: PAGE_SIZE, cursor: null });

  return (
    <main className="py-6 px-page">
      <div className="py-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Heading as="h1" size="h1" className="mb-2">
              {t('title')}
            </Heading>
            <Text tone="muted">{t('description')}</Text>
          </div>
          <Button asChild>
            <Link href={`/${locale}/qr/new`}>{t('createCta')}</Link>
          </Button>
        </div>

        <QrListClient
          createHref={`/${locale}/qr/new`}
          initialPage={initialPage}
          pageSize={PAGE_SIZE}
        />
      </div>
    </main>
  );
}

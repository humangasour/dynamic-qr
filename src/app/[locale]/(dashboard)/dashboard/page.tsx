import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard.page');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function DashboardPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();
  const t = await getTranslations('dashboard.page');
  const locale = await getLocale();

  return (
    <main className="py-6 px-page">
      <div className="py-6">
        <div className="text-center">
          <Heading as="h1" size="h1" className="mb-4">
            {t('welcomeTitle')}
          </Heading>
          <Text size="lead" tone="muted" className="mb-8">
            {t('welcomeSubtitle')}
          </Text>
          <div className="mb-8">
            <Button asChild size="lg">
              <Link href={`/${locale}/qr/new`}>{t('createCta')}</Link>
            </Button>
          </div>
          {/* Removed the temporary Coming Soon box */}
        </div>
      </div>
    </main>
  );
}

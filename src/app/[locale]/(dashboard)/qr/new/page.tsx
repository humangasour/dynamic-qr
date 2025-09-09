import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { CreateQrForm } from '@/components/qr/CreateQrForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qr.page.create');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function CreateQrPage() {
  // This will redirect to sign-in if user is not authenticated (server component safe)
  await requireUserIdForServerComponent();
  const t = await getTranslations('qr.page.create');

  return (
    <main className="py-6 px-page">
      <div className="py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Heading as="h1" size="h1" className="mb-4">
              {t('title')}
            </Heading>
            <Text size="lead" tone="muted">
              {t('description')}
            </Text>
          </div>
          <CreateQrForm />
        </div>
      </div>
    </main>
  );
}

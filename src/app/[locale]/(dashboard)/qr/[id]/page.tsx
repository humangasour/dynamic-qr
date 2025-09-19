import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { QrEditClient } from '@/components/qr/QrEditClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations('qr.page.details');
  return {
    title: t('metadataTitle', { id }),
    description: t('metadataDescription'),
  };
}

export default async function QrEditPage({ params }: PageProps) {
  await requireUserIdForServerComponent();
  const { id } = await params;

  return <QrEditClient id={id} />;
}

// TODO: generateDynamicParams, loading.tsx in the dynamic route

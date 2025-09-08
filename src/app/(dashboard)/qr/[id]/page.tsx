import type { Metadata } from 'next';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { QrDetailsClient } from '@/components/qr/QrDetailsClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `QR Details • ${id}`,
    description: 'View and download your QR code assets',
  };
}

export default async function QrDetailsPage({ params }: PageProps) {
  await requireUserIdForServerComponent();
  const { id } = await params;

  return <QrDetailsClient id={id} />;
}

// TODO: generateDynamicParams, loading.tsx in the dynamic route

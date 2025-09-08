import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireUserIdForServerComponent } from '@/features/auth/server';
import { getTrpcCallerReadOnly } from '@infra/trpc/server-caller';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/ui/button';
import { QrDetails } from '@/components/qr/QrDetails';
import { mapTrpcError, toUiErrorForBoundary } from '@/shared/utils/trpc-ui-errors';

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

  // Use read-only server-side caller to avoid cookie writes in Server Components
  const trpc = await getTrpcCallerReadOnly();

  let data;
  try {
    data = await trpc.qr.getById({ id });
  } catch (error) {
    const ui = mapTrpcError(error);
    if (ui.type === 'not_found') {
      notFound();
    }
    // For other types, throw an error with a stable UI_* name for the boundary
    throw toUiErrorForBoundary(
      ui.type === 'bad_request'
        ? { ...ui, message: 'Invalid QR code ID format' }
        : ui.type === 'unauthorized'
          ? { ...ui, message: 'Access denied' }
          : ui,
    );
  }

  return (
    <main className="py-6 px-page">
      <div className="py-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Heading as="h1" size="h1" className="mb-2">
              {data.name}
            </Heading>
            <Text tone="muted">QR details and asset downloads</Text>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <QrDetails
          id={data.id}
          name={data.name}
          targetUrl={data.targetUrl}
          slug={data.slug}
          svgUrl={data.svgUrl}
          pngUrl={data.pngUrl}
        />
      </div>
    </main>
  );
}

// TODO: generateDynamicParams, loading.tsx in the dynamic route

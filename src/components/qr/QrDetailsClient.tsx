'use client';

import Link from 'next/link';

import { api } from '@/infrastructure/trpc/client';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';

import { QrDetails } from './QrDetails';

export function QrDetailsClient({ id }: { id: string }) {
  const { data, error, isLoading } = api.qr.getById.useQuery(
    { id },
    {
      retry: 1,
    },
  );

  if (isLoading) {
    return (
      <div className="py-6 px-page">
        <div className="py-6 max-w-5xl mx-auto">
          <div className="mb-6 h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted rounded animate-pulse" />
            <div className="h-80 bg-muted rounded animate-pulse" />
            <div className="h-40 bg-muted rounded animate-pulse lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="py-6 px-page">
        <div className="py-6 max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                QR not found
              </Heading>
              <Text tone="muted">We couldn’t load this QR code.</Text>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
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

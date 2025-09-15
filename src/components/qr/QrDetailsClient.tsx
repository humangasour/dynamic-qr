'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { api } from '@/infrastructure/trpc/client';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { GenericError, NotFoundError } from '@/components/ui/error-display';
import { Skeleton } from '@/components/ui/skeleton';

import { QrDetails } from './QrDetails';

export function QrDetailsClient({ id }: { id: string }) {
  const t = useTranslations('qr.details.page');
  const locale = useLocale();
  const { data, error, isLoading, refetch } = api.qr.getById.useQuery(
    { id },
    {
      retry: 1,
    },
  );

  if (isLoading) {
    return (
      <main className="py-6 px-page">
        <div className="py-6 max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-72 mt-2" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-40 w-full lg:col-span-2" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    const normalizedError: Error =
      error instanceof Error
        ? error
        : new Error((error as { message?: string })?.message ?? 'Request failed');
    return (
      <GenericError
        error={normalizedError}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data) {
    return <NotFoundError />;
  }

  return (
    <main className="py-6 px-page">
      <div className="py-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Heading as="h1" size="h1" className="mb-2">
              {data.name}
            </Heading>
            <Text tone="muted">{t('subtitle')}</Text>
          </div>
          <Button asChild variant="outline">
            <Link href={`/${locale}/dashboard`}>{t('backToDashboard')}</Link>
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

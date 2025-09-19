'use client';

import { useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { InfiniteData } from '@tanstack/react-query';

import { api } from '@/infrastructure/trpc/client';
import { Button } from '@/components/ui/button';
import QrCard from '@/components/qr/QrCard';
import QrCardSkeleton from '@/components/qr/QrCardSkeleton';
import { Text } from '@/components/typography/Text';
import { ErrorDisplay } from '@/components/ui/error-display';
import type { ListQrOutput } from '@/shared/schemas/qr';
import { cn } from '@/lib/utils';

export interface Props {
  createHref: string;
  pageSize?: number;
  initialPage?: ListQrOutput | null;
}

export function QrListClient({ createHref, initialPage, pageSize = 10 }: Props) {
  // Declare 'errors' first so the i18n linter tracks the last ns as the page ns
  const te = useTranslations('errors');
  const t = useTranslations('qr.page.index');

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    api.qr.list.useInfiniteQuery(
      { limit: pageSize },
      {
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        initialCursor: null,
        retry: 1,
        staleTime: 60_000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        initialData: initialPage
          ? ({
              pages: [initialPage],
              pageParams: [null],
            } as InfiniteData<ListQrOutput, string | null | undefined>)
          : undefined,
      },
    );

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const totalCount = data?.pages?.[0]?.totalCount ?? 0;
  const remainingCount = Math.max(0, totalCount - items.length);
  const nextPageSkeletonCount = Math.min(pageSize, remainingCount);

  const gridClass = cn(
    'grid gap-5',
    '[grid-template-columns:repeat(auto-fit,minmax(300px,clamp(320px,30vw,360px)))]',
  );

  // Auto-load next page when sentinel enters viewport
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && !error) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: '600px 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, error]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 text-sm text-muted-foreground">{`${t('totalLabel')}: …`}</div>
        {/* Auto-fit grid prevents card squish/merging at narrow widths */}
        <div className={gridClass}>
          {Array.from({ length: 8 }).map((_, i) => (
            <QrCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <ErrorDisplay
        layout="inline"
        title={te('generic.title')}
        description={te('generic.description')}
        actions={
          <Button variant="outline" onClick={() => window.location.reload()}>
            {te('actions.tryAgain')}
          </Button>
        }
      />
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16 border border-dashed rounded-md">
        <Text size="lead" className="mb-4">
          {t('emptyTitle')}
        </Text>
        <Text tone="muted" className="mb-6">
          {t('emptyDescription')}
        </Text>
        <Button asChild>
          <Link href={createHref}>{t('createCta')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">{`${t('totalLabel')}: ${totalCount}`}</div>

      {/* Auto-fit minmax grid prevents layout collisions as viewport changes */}
      <div className={gridClass}>
        {items.map((qr) => (
          <QrCard
            key={qr.id}
            id={qr.id}
            name={qr.name}
            slug={qr.slug}
            svgUrl={qr.svgUrl}
            targetUrl={qr.current_target_url}
            versionCount={qr.versionCount}
            weekScans={qr.weekScans}
            updatedAt={qr.updated_at}
          />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: nextPageSkeletonCount }).map((_, i) => (
            <QrCardSkeleton key={`more-${i}`} />
          ))}
      </div>

      {hasNextPage ? (
        <div className="mt-6 space-y-3">
          {/* Sentinel triggers next page when visible */}
          <div ref={loadMoreRef} aria-hidden className="h-6" />
          {error ? (
            <div className="max-w-lg mx-auto">
              <ErrorDisplay
                layout="inline"
                title={t('loadMoreErrorTitle')}
                description={t('loadMoreErrorDescription')}
                actions={
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    {te('actions.tryAgain')}
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default QrListClient;

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { QrListClient } from '@/components/qr/QrListClient';

// Simple i18n mock
const mockMessages: Record<string, string> = {
  'qr.page.index.title': 'Your QR Codes',
  'qr.page.index.description': 'List description',
  'qr.page.index.createCta': 'Create New QR Code',
  'qr.page.index.totalLabel': 'Total',
  'qr.page.index.emptyTitle': 'No QR codes yet',
  'qr.page.index.emptyDescription': 'Create your first QR code to get started.',
  'qr.page.index.loadMoreErrorTitle': 'Could not load more',
  'qr.page.index.loadMoreErrorDescription': 'Something went wrong while fetching the next page.',
  'qr.card.linkSection.open': 'Open',
};

function getMsg(path: string): string {
  return mockMessages[path] ?? path;
}

// i18n mocks
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => getMsg(ns ? `${ns}.${key}` : key),
  useLocale: () => 'en',
}));

// Mock tRPC React client hook
const useInfiniteQueryMock = vi.fn();
vi.mock('@/infrastructure/trpc/client', () => ({
  api: {
    qr: { list: { useInfiniteQuery: (...args: unknown[]) => useInfiniteQueryMock(...args) } },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('QrListClient', () => {
  it('renders loading skeletons', () => {
    useInfiniteQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    const { container } = render(<QrListClient createHref="/en/qr/new" />);
    expect(screen.getByText(`${getMsg('qr.page.index.totalLabel')}: …`)).toBeVisible();
    // Skeleton cards are hidden groups
    const skeletons = container.querySelectorAll('div[aria-hidden="true"][data-slot="card"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state', () => {
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [{ items: [], totalCount: 0, nextCursor: null }], pageParams: [null] },
      error: null,
      isLoading: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(<QrListClient createHref="/en/qr/new" />);
    expect(screen.getByText(getMsg('qr.page.index.emptyTitle'))).toBeVisible();
    expect(screen.getByRole('link', { name: getMsg('qr.page.index.createCta') })).toBeVisible();
  });

  it('renders items and shows pagination loader', () => {
    const items = [
      {
        id: 'qr-1',
        name: 'Item One',
        slug: 'one',
        svgUrl: 'https://cdn/x.svg',
        current_target_url: 'https://one',
        versionCount: 1,
        weekScans: 2,
        updated_at: '2024-09-10T10:00:00.000Z',
      },
      {
        id: 'qr-2',
        name: 'Item Two',
        slug: 'two',
        svgUrl: 'https://cdn/y.svg',
        current_target_url: 'https://two',
        versionCount: 0,
        weekScans: 0,
        updated_at: '2024-09-10T09:00:00.000Z',
      },
    ];
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [{ items, totalCount: 5, nextCursor: 'cursor' }], pageParams: [null] },
      error: null,
      isLoading: false,
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage: vi.fn(),
    });

    const { container } = render(<QrListClient createHref="/en/qr/new" pageSize={3} />);
    expect(screen.getByText(`${getMsg('qr.page.index.totalLabel')}: 5`)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Item One' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Item Two' })).toBeVisible();

    // 3 skeleton placeholders for next page
    const skeletons = container.querySelectorAll('div[aria-hidden="true"][data-slot="card"]');
    expect(skeletons.length).toBe(3);
  });

  it('shows only remaining skeletons when fewer than page size', () => {
    const items = Array.from({ length: 10 }).map((_, i) => ({
      id: `qr-${i + 1}`,
      name: `Item ${i + 1}`,
      slug: `slug-${i + 1}`,
      svgUrl: 'https://cdn/example.svg',
      current_target_url: 'https://example.com',
      versionCount: 0,
      weekScans: 0,
      updated_at: '2024-09-10T10:00:00.000Z',
    }));
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [{ items, totalCount: 14, nextCursor: 'cursor' }], pageParams: [null] },
      error: null,
      isLoading: false,
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage: vi.fn(),
    });

    const { container } = render(<QrListClient createHref="/en/qr/new" pageSize={10} />);
    // Only 4 items remain, so 4 skeletons
    const skeletons = container.querySelectorAll('div[aria-hidden="true"][data-slot="card"]');
    expect(skeletons.length).toBe(4);
  });
});

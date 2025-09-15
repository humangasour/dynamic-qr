import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { createNextIntlMock, getMsg } from '@test/utils/i18n';
import { QrCard } from '@/components/qr/QrCard';
import { copyTextToClipboard } from '@/lib/clipboard';

// i18n mock before component import
vi.mock('next-intl', () => createNextIntlMock());

// Silence toasts
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Stub clipboard
vi.mock('@/lib/clipboard', async (orig) => {
  const actual = (await orig()) as object;
  const copySpy = vi.fn().mockResolvedValue(true);
  return {
    ...(actual as Record<string, unknown>),
    copyTextToClipboard: copySpy,
  };
});

describe('QrCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderCard() {
    return render(
      <QrCard
        id="qr-1"
        name="My QR"
        slug="my-qr"
        svgUrl="https://cdn.example/1.svg"
        pngUrl="https://cdn.example/1.png"
        targetUrl="https://example.com"
        versionCount={3}
        weekScans={5}
        updatedAt="2024-09-10T12:00:00.000Z"
      />,
    );
  }

  it('renders basic info and actions', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'My QR' })).toBeVisible();
    expect(screen.getByAltText('QR code for My QR')).toBeVisible();
    expect(screen.getByText('/r/my-qr')).toBeVisible();
    expect(screen.getByText('https://example.com')).toBeVisible();
    // Copy buttons
    expect(screen.getByRole('button', { name: getMsg('qr.details.copy.linkAria') })).toBeVisible();
    expect(
      screen.getByRole('button', { name: getMsg('qr.details.copy.targetAria') }),
    ).toBeVisible();
    // Primary actions
    expect(screen.getByRole('link', { name: 'Open short link' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Edit details' })).toBeVisible();
    // Badges & timestamp label
    expect(screen.getByLabelText('Versions: 3')).toBeVisible();
    expect(screen.getByLabelText('Scans this week: 5')).toBeVisible();
    expect(screen.getByText(/Updated /)).toBeVisible();
  });

  it('copies link and target when clicking copy buttons', async () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: getMsg('qr.details.copy.linkAria') }));
    fireEvent.click(screen.getByRole('button', { name: getMsg('qr.details.copy.targetAria') }));

    // Called for full short link and target URL
    expect(copyTextToClipboard).toHaveBeenCalledWith(expect.stringMatching(/\/r\/my-qr$/));
    expect(copyTextToClipboard).toHaveBeenCalledWith('https://example.com');
  });
});

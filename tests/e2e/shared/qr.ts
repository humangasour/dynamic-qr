import type { Page } from '@playwright/test';

export async function createQrViaApi(page: Page, name: string, targetUrl = 'https://example.com') {
  const res = await page.request.post('/api/trpc/qr.create', {
    data: { name, targetUrl },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok()) {
    throw new Error(`qr.create failed: ${res.status()} ${await res.text()}`);
  }
}

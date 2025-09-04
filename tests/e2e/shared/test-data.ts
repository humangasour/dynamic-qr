import { request } from '@playwright/test';

export async function createTestData() {
  // Placeholder for real API/DB setup via Playwright request
  const slug = `e2e-${Date.now()}`;
  return {
    qrCode: {
      slug,
      targetUrl: 'https://example.com',
    },
  } as const;
}

export async function createInactiveQRCode() {
  const slug = `e2e-inactive-${Date.now()}`;
  return {
    qrCode: {
      slug,
      targetUrl: null,
    },
  } as const;
}

export async function cleanupTestData() {
  // Placeholder for delete/cleanup logic
  await request.newContext();
}

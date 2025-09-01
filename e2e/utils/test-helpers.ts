import type { Page } from '@playwright/test';

export async function waitForRedirect(page: Page, expectedUrl: string, timeout = 5000) {
  try {
    await page.waitForURL(expectedUrl, { timeout });
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentUrl(page: Page): Promise<string> {
  return page.url();
}

export function generateRandomSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomEmail(): string {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `test-${randomString}@example.com`;
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  if (process.env.CI) {
    await page.screenshot({
      path: `test-results/screenshots/${testName}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}

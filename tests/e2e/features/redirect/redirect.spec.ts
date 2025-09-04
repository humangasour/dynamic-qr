import { test, expect } from '@playwright/test';

test.describe('QR Code Redirect Feature - E2E Tests', () => {
  test.describe('Fallback Behavior', () => {
    test('should show fallback page when no target URL is found', async ({ page }) => {
      await page.goto('/r/invalid-slug');

      // Should show the graceful fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
      await expect(page.locator('code')).toContainText('/r/invalid-slug');
    });
  });

  test.describe('Routing and Navigation', () => {
    test('should handle multiple navigation attempts gracefully', async ({ page }) => {
      await page.goto('/r/invalid-slug');

      // Try navigating again
      await page.goto('/r/invalid-slug');
      await expect(page.locator('h1')).toContainText('Link Not Found');
    });
  });
});

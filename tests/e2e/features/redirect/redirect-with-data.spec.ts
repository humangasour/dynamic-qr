import { test, expect } from '@playwright/test';

import { createTestData, cleanupTestData, createInactiveQRCode } from '../../shared/test-data';

test.describe('QR Code Redirect Feature - E2E Tests with Real Data', () => {
  let testData: Awaited<ReturnType<typeof createTestData>>;
  let inactiveTestData: Awaited<ReturnType<typeof createInactiveQRCode>>;

  test.beforeAll(async () => {
    // Set up test data before all tests
    testData = await createTestData();
    inactiveTestData = await createInactiveQRCode();
  });

  test.afterAll(async () => {
    // Clean up test data after all tests
    await cleanupTestData();
    await cleanupTestData();
  });

  test.describe('Real Data Integration', () => {
    test('should handle real database data in browser environment', async ({ page }) => {
      // Test that the redirect page works with actual database data
      const response = await page.goto(`/r/${testData.qrCode.slug}`);

      // Should load successfully (either redirect or show appropriate content)
      expect(response?.status()).toBe(200);
    });

    test('should handle inactive QR codes from real database', async ({ page }) => {
      // Test that inactive QR codes show fallback page
      await page.goto(`/r/${inactiveTestData.qrCode.slug}`);

      // Should show the graceful fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
      await expect(page.locator('code')).toContainText(`/r/${inactiveTestData.qrCode.slug}`);
    });
  });
});

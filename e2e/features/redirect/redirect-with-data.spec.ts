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
    await cleanupTestData(testData);
    await cleanupTestData(inactiveTestData);
  });

  test.describe('Real Data Integration', () => {
    test('should handle real database data in browser environment', async ({ page }) => {
      // Test that the redirect page works with actual database data
      const response = await page.goto(`/r/${testData.qrCode.slug}`);

      // Should load successfully (either redirect or show appropriate content)
      expect(response?.status()).toBe(200);

      console.log(`Test QR code slug: ${testData.qrCode.slug}`);
      console.log(`Expected target URL: ${testData.qrCode.targetUrl}`);
    });

    test('should handle inactive QR codes from real database', async ({ page }) => {
      // Test that inactive QR codes show fallback page
      await page.goto(`/r/${inactiveTestData.qrCode.slug}`);

      // Should show the graceful fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
      await expect(page.locator('code')).toContainText(`/r/${inactiveTestData.qrCode.slug}`);
    });
  });

  test.describe('Browser-Specific Edge Cases', () => {
    test('should handle URL encoding in browser', async ({ page }) => {
      // Test with a slug that has spaces (URL encoded)
      const slugWithSpaces = 'test%20slug%20with%20spaces';

      await page.goto(`/r/${slugWithSpaces}`);

      // Should show the graceful fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
    });

    test('should handle very long URLs in browser', async ({ page }) => {
      // Test with a very long slug
      const longSlug = 'a'.repeat(100);

      await page.goto(`/r/${longSlug}`);

      // Should show the graceful fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
    });
  });

  test.describe('Real Browser Performance', () => {
    test('should handle real database queries in browser', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`/r/${testData.qrCode.slug}`);

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time for a real database query
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle 404 queries quickly in browser', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/r/non-existent-slug');

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time for a 404
      expect(loadTime).toBeLessThan(2000);

      // Should show the fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
    });
  });
});

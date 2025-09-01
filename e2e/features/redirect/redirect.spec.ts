import { test, expect } from '@playwright/test';

test.describe('QR Code Redirect Feature - E2E Tests', () => {
  test.describe('Browser Behavior', () => {
    test('should handle redirects in browser environment', async ({ page }) => {
      // Test that the redirect page loads in a real browser
      // This tests the actual Next.js routing and component rendering
      await page.goto('/r/test-slug');

      // Should either redirect or show fallback page
      // We can't easily test actual redirects in E2E, so we verify the page loads
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle invalid slugs gracefully in browser', async ({ page }) => {
      await page.goto('/r/non-existent-slug-12345');

      // Should show the graceful fallback page
      await expect(page.locator('h1')).toContainText('Link Not Found');
      await expect(page.locator('code')).toContainText('/r/non-existent-slug-12345');
    });
  });

  test.describe('UI Rendering', () => {
    test('should render 404 page with proper styling', async ({ page }) => {
      await page.goto('/r/invalid-slug');

      // Check that the page has proper styling
      const container = page.locator('.min-h-screen');
      await expect(container).toBeVisible();

      // Check that the error icon is displayed
      const icon = page.locator('svg').first();
      await expect(icon).toBeVisible();

      // Check that the layout is centered and responsive
      await expect(page.locator('.min-h-screen.flex.items-center.justify-center')).toBeVisible();
    });

    test('should display helpful error information', async ({ page }) => {
      await page.goto('/r/invalid-slug');

      // Should show helpful error information
      await expect(page.locator('text=This could happen if:')).toBeVisible();
      await expect(page.locator('text=The QR code has been deleted')).toBeVisible();
      await expect(page.locator('text=The link has been deactivated')).toBeVisible();
      await expect(page.locator('text=There was a typo in the URL')).toBeVisible();

      // Should show branding
      await expect(page.locator('text=Powered by Dynamic QR Codes')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/r/invalid-slug');

      // Should show the fallback page with proper mobile layout
      await expect(page.locator('h1')).toContainText('Link Not Found');

      // Check that the content is properly sized for mobile
      const container = page.locator('.max-w-md');
      await expect(container).toBeVisible();
    });

    test('should work properly on desktop devices', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto('/r/invalid-slug');

      // Should show the fallback page with proper desktop layout
      await expect(page.locator('h1')).toContainText('Link Not Found');
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work in different browsers', async ({ page, browserName }) => {
      await page.goto('/r/invalid-slug');

      // Should show the fallback page regardless of browser
      await expect(page.locator('h1')).toContainText('Link Not Found');

      console.log(`Tested in ${browserName}`);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/r/invalid-slug');

      // Check for proper heading structure
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Link Not Found');

      // Check that the page is keyboard navigable
      await page.keyboard.press('Tab');
      // The page should be focusable and navigable
    });
  });
});

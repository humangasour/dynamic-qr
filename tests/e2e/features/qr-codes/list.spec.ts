import { test, expect } from '@playwright/test';

import { ensureNonProduction } from '../../shared/safety';
import { signInAndEnsureOrg } from '../../shared/auth';
import { createQrViaApi } from '../../shared/qr';

const E2E_AUTH_ENABLED = process.env.E2E_AUTH_ENABLED === 'true';

test.describe('QR Codes: List View', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(() => {
    ensureNonProduction();
  });

  test('renders grid and action buttons', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');
    await signInAndEnsureOrg(page);
    await createQrViaApi(page, `E2E List QR ${Date.now()}`);

    await page.goto('/qr');
    await expect(page.getByRole('heading', { name: 'Your QR Codes' })).toBeVisible({
      timeout: 30000,
    });

    // Wait for at least one card rendered
    await expect(page.getByRole('link', { name: 'Open short link' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit details' }).first()).toBeVisible();

    // Copy buttons present
    await expect(page.getByRole('button', { name: 'Copy short link' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy target URL' }).first()).toBeVisible();

    // More actions dropdown shows download links
    await page.getByRole('button', { name: 'More' }).first().click();

    // Wait for dropdown menu to appear
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Look for download links within the dropdown menu
    const dropdownMenu = page.locator('[role="menu"]');
    await expect(dropdownMenu.getByText('Download PNG')).toBeVisible();
    await expect(dropdownMenu.getByText('Download SVG')).toBeVisible();
  });
});

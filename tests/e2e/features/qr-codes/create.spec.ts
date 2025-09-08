import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import { ensureNonProduction } from '../../shared/safety';
import { waitForAuthenticated } from '../../shared/auth';

const E2E_AUTH_ENABLED = process.env.E2E_AUTH_ENABLED === 'true';

test.describe('QR Codes: Create Flow', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(() => {
    ensureNonProduction();
  });

  // Ensure QR test user exists before running tests
  test.beforeAll(async () => {
    const qrTestEmail = process.env.E2E_QR_USER_EMAIL || 'qr-test@example.com';
    const qrTestPassword = process.env.E2E_QR_USER_PASSWORD || 'qr-test-password-123';

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return; // silently skip if not available

    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
      // Try to sign up the QR test user
      const { error } = await admin.auth.signUp({
        email: qrTestEmail,
        password: qrTestPassword,
        options: {
          data: {
            name: 'QR Test User',
          },
        },
      });

      if (error && !error.message.includes('already registered')) {
        console.warn('Failed to create QR test user:', error.message);
      }
    } catch (e) {
      console.warn('QR test user creation error (ignored):', e);
    }
  });

  async function signInAndEnsureOrg(page: import('@playwright/test').Page) {
    // Use a different user for QR tests to avoid conflicts with auth flow tests
    const qrTestEmail = process.env.E2E_QR_USER_EMAIL || 'qr-test@example.com';
    const qrTestPassword = process.env.E2E_QR_USER_PASSWORD || 'qr-test-password-123';

    // Clear all storage and cookies to ensure clean state
    await page.context().clearCookies();

    await page.goto('/sign-in');

    // Clear storage after navigation
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.getByLabel('Email address').fill(qrTestEmail);
    await page.getByLabel('Password').fill(qrTestPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await waitForAuthenticated(page, { timeout: 30000 });

    // Add a small delay to ensure session is fully established
    await page.waitForTimeout(1000);

    try {
      const ensureRes = await page.request.post('/api/trpc/auth.ensureUserAndOrg', {
        data: { 0: { json: { userName: `QR Test User ${Date.now()}` } } },
      });
      if (!ensureRes.ok()) {
        console.warn('ensureUserAndOrg failed with status:', ensureRes.status());
      }
    } catch (e) {
      console.warn('ensureUserAndOrg request error (ignored):', e);
    }
  }

  test('creates a new QR and shows details page', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');
    await signInAndEnsureOrg(page);

    // Go to create page
    await page.goto('/qr/new');
    await expect(page).toHaveURL(/\/qr\/new\b/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Create New QR Code' })).toBeVisible({
      timeout: 30000,
    });

    // Fill and submit
    const name = `E2E QR ${Date.now()}`;
    await page.getByLabel('Name').fill(name);
    await page.getByLabel('Target URL').fill('https://example.com');
    await page.getByRole('button', { name: 'Create QR Code' }).click();

    // Lands on details page
    await page.waitForURL(/\/qr\/[^/]+$/, { timeout: 30000 });
    await expect(page.getByText('QR details and asset downloads')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Link & Target' })).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByText('Short Link')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('link', { name: 'Download PNG' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy PNG to clipboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download SVG' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy SVG to clipboard' })).toBeVisible();

    // Short link and target controls present
    await expect(page.getByRole('link', { name: 'Open short link in new tab' })).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByRole('button', { name: 'Copy short link' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open target URL in new tab' })).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByRole('button', { name: 'Copy target URL' })).toBeVisible();
  });

  test('shows validation errors for invalid form input', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');
    await signInAndEnsureOrg(page);
    await page.goto('/qr/new');
    await expect(page).toHaveURL(/\/qr\/new\b/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Create New QR Code' })).toBeVisible({
      timeout: 30000,
    });

    // Submit empty form
    await page.getByRole('button', { name: 'Create QR Code' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Please enter a valid URL')).toBeVisible();
  });
});

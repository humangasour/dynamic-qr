import { test, expect } from '@playwright/test';

import { ensureNonProduction } from '../../shared/safety';
import { waitForAuthenticated } from '../../shared/auth';

const E2E_AUTH_ENABLED = process.env.E2E_AUTH_ENABLED === 'true';

test.describe('Auth Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(() => {
    ensureNonProduction();
  });

  test('visiting / unauthenticated redirects to /auth/sign-in', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/sign-in\b/, { timeout: 20000 });
  });

  test('signs in and lands on dashboard, can sign out', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');

    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    await page.getByLabel('Email address').fill(process.env.E2E_USER_EMAIL || 'user@example.com');
    await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD || 'user-password-123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await waitForAuthenticated(page, { timeout: 30000 });

    // Sign out
    await page.getByRole('button', { name: /Sign out/ }).click();
    await expect(page).toHaveURL(/\/auth\/sign-in\b/, { timeout: 20000 });
  });

  test('visiting / when authenticated redirects to /app', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');

    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email address').fill(process.env.E2E_USER_EMAIL || 'user@example.com');
    await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD || 'user-password-123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await waitForAuthenticated(page, { timeout: 30000 });

    // Add a small delay to ensure session is fully established
    await page.waitForTimeout(1000);

    await page.goto('/');
    await expect(page).toHaveURL(/\/app\b/, { timeout: 20000 });
  });
});

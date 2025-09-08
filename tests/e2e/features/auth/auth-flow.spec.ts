import { test, expect } from '@playwright/test';

import { ensureNonProduction } from '../../shared/safety';
import { waitForAuthenticated } from '../../shared/auth';

const E2E_AUTH_ENABLED = process.env.E2E_AUTH_ENABLED === 'true';

test.describe('Auth Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(() => {
    ensureNonProduction();
  });

  test('visiting / unauthenticated redirects to /sign-in', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL(/\/sign-in\b/, { timeout: 20000 });
  });

  test('signs in and lands on dashboard, can sign out', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');

    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/sign-in');

    const email1 = (process.env.E2E_USER_EMAIL || 'user@example.com').trim();
    const password1 = (process.env.E2E_USER_PASSWORD || 'user-password-123').trim();
    const emailInput1 = page.getByLabel('Email address');
    await emailInput1.click();
    await emailInput1.fill('');
    await emailInput1.type(email1, { delay: 10 });
    await page.keyboard.press('Tab');

    const passwordInput1 = page.getByLabel('Password');
    await passwordInput1.click();
    await passwordInput1.fill('');
    await passwordInput1.type(password1, { delay: 10 });
    await page.getByRole('button', { name: 'Sign in' }).click();
    await waitForAuthenticated(page, { timeout: 30000 });

    // Open account menu via stable test id (label may be hidden on small viewports)
    await page.getByTestId('account-menu-trigger').click();
    // Click sign out from dropdown menu
    await page.getByRole('menuitem', { name: /Sign out/i }).click();
    await expect(page).toHaveURL(/\/sign-in\b/, { timeout: 20000 });
  });

  test('visiting / when authenticated redirects to /dashboard', async ({ page }) => {
    test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');

    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/sign-in');
    const email2 = (process.env.E2E_USER_EMAIL || 'user@example.com').trim();
    const password2 = (process.env.E2E_USER_PASSWORD || 'user-password-123').trim();
    const emailInput2 = page.getByLabel('Email address');
    await emailInput2.click();
    await emailInput2.fill('');
    await emailInput2.type(email2, { delay: 10 });
    await page.keyboard.press('Tab');

    const passwordInput2 = page.getByLabel('Password');
    await passwordInput2.click();
    await passwordInput2.fill('');
    await passwordInput2.type(password2, { delay: 10 });
    await page.getByRole('button', { name: 'Sign in' }).click();
    await waitForAuthenticated(page, { timeout: 30000 });

    // Add a small delay to ensure session is fully established
    await page.waitForTimeout(1000);

    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard\b/, { timeout: 20000 });
  });
});

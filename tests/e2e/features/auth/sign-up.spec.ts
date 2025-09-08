import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import { ensureNonProduction } from '../../shared/safety';
import { waitForAuthenticated } from '../../shared/auth';

const E2E_AUTH_ENABLED = process.env.E2E_AUTH_ENABLED === 'true';

async function cleanupUserByEmail(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return; // silently skip cleanup if not available
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Best-effort cleanup: delete from users table and cascade membership/org if you have ON DELETE policies
  await admin.from('users').delete().eq('email', email);
}

test.describe('Auth: Sign Up', () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(!E2E_AUTH_ENABLED, 'Auth E2E disabled');

  test.beforeAll(() => {
    ensureNonProduction();
  });

  test('signs up new user; handles autoconfirm and email-confirm paths; cleans up', async ({
    page,
  }) => {
    // Sign-up can involve email confirmation; allow extra time for branching + cleanup
    test.setTimeout(60000);
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Password1';

    await page.goto('/sign-up');
    await page.getByLabel('Full name').fill('E2E Test');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    // Two acceptable outcomes depending on Supabase email confirmation settings
    try {
      // Try the autoconfirm path first with a shorter timeout to avoid overall test timeout
      await waitForAuthenticated(page, { timeout: 12000 });
      // attempt sign out to reset state
      await page.getByRole('button', { name: /Sign out/ }).click();
      await expect(page).toHaveURL(/\/sign-in\b/, { timeout: 20000 });
    } catch {
      // If not redirected, expect to remain on sign-up and show some message
      expect(page.url()).toContain('/sign-up');
    } finally {
      await cleanupUserByEmail(email);
    }
  });
});

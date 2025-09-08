import { expect, type Page } from '@playwright/test';

// Waits for Supabase password grant to complete and session to be present
export async function waitForAuthenticated(page: Page, opts: { timeout?: number } = {}) {
  const timeout = opts.timeout ?? 30000;

  // 1) Best-effort wait for Supabase token response (password grant)
  try {
    await page.waitForResponse(
      (r) =>
        r.url().includes('/auth/v1/token') &&
        (r.request().postData()?.includes('grant_type=password') ?? false) &&
        r.ok(),
      { timeout: Math.min(timeout, 10000) },
    );
  } catch {
    // ignore; some flows may restore session from existing cookies
  }

  // 2) Wait until either cookie or localStorage session exists
  await page.waitForFunction(
    () => {
      try {
        const lsKey = Object.keys(window.localStorage).find(
          (k) => k.startsWith('sb-') && k.endsWith('-auth-token'),
        );
        const hasLocal = !!lsKey && !!window.localStorage.getItem(lsKey!);
        const hasCookie =
          document.cookie.includes('sb:token') ||
          document.cookie.includes('sb-access-token') ||
          document.cookie.includes('sb-refresh-token') ||
          /sb-\d+-auth-token/.test(document.cookie);
        return hasLocal || hasCookie;
      } catch {
        return false;
      }
    },
    { timeout },
  );

  // 3) Ensure we land on /dashboard and it rendered
  if (!/\/dashboard\b/.test(page.url())) {
    await page.goto('/dashboard');
  }
  await expect(page).toHaveURL(/\/dashboard\b/, { timeout });
  await expect(page.getByRole('heading', { name: 'Welcome to Dynamic QR' })).toBeVisible({
    timeout,
  });
}

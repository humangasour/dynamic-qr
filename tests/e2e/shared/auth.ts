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

// Sign in via UI and ensure org exists using tRPC auth.ensureUserAndOrg
export async function signInAndEnsureOrg(page: Page) {
  const email = process.env.E2E_QR_USER_EMAIL || 'qr-test@example.com';
  const password = process.env.E2E_QR_USER_PASSWORD || 'qr-test-password-123';

  await page.context().clearCookies();
  await page.goto('/sign-in');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await waitForAuthenticated(page, { timeout: 30000 });

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

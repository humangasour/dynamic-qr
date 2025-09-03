import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Load environment variables from .env.e2e for e2e tests
config({ path: '.env.e2e' });

// Safety check: Prevent destructive e2e tests on production
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production' ||
  process.env.E2E_TEST_ENV === 'production';

if (isProduction && process.env.E2E_ALLOW_DESTRUCTIVE_TESTS !== 'true') {
  throw new Error(
    '🚨 E2E tests are blocked on production for safety! ' +
      'Set E2E_ALLOW_DESTRUCTIVE_TESTS=true to override (NOT RECOMMENDED)',
  );
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI || isProduction,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'junit' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Timeout configuration from environment */
    actionTimeout: parseInt(process.env.E2E_TIMEOUT || '30000'),
    navigationTimeout: parseInt(process.env.E2E_NAVIGATION_TIMEOUT || '10000'),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    // /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev -- --port 3001',
    url: process.env.E2E_BASE_URL || 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});

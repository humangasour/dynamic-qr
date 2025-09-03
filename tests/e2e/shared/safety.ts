export const ensureNonProduction = () => {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.E2E_TEST_ENV === 'production';

  if (isProduction && process.env.E2E_ALLOW_DESTRUCTIVE_TESTS !== 'true') {
    throw new Error('E2E tests are blocked on production for safety!');
  }
};

/**
 * Safety utilities for E2E tests
 * Prevents destructive operations on production environments
 */

export interface SafetyConfig {
  allowDestructiveTests: boolean;
  testDatabasePrefix: string;
  maxTestDataAgeHours: number;
  autoCleanup: boolean;
  cleanupOnFailure: boolean;
  testEnv: string;
}

/**
 * Get safety configuration from environment variables
 */
export function getSafetyConfig(): SafetyConfig {
  return {
    allowDestructiveTests: process.env.E2E_ALLOW_DESTRUCTIVE_TESTS === 'true',
    testDatabasePrefix: process.env.E2E_TEST_DATABASE_PREFIX || 'e2e_test_',
    maxTestDataAgeHours: parseInt(process.env.E2E_MAX_TEST_DATA_AGE_HOURS || '24'),
    autoCleanup: process.env.E2E_AUTO_CLEANUP !== 'false',
    cleanupOnFailure: process.env.E2E_CLEANUP_ON_FAILURE !== 'false',
    testEnv: process.env.E2E_TEST_ENV || 'local',
  };
}

/**
 * Check if the current environment is production
 */
export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.E2E_TEST_ENV === 'production'
  );
}

/**
 * Check if destructive tests are allowed
 */
export function allowDestructiveTests(): boolean {
  const config = getSafetyConfig();
  return config.allowDestructiveTests && !isProduction();
}

/**
 * Validate test data prefix to ensure it's safe
 */
export function validateTestDataPrefix(prefix: string): boolean {
  const config = getSafetyConfig();
  return prefix.startsWith(config.testDatabasePrefix);
}

/**
 * Check if test data is within allowed age
 */
export function isTestDataWithinAge(timestamp: number): boolean {
  const config = getSafetyConfig();
  const maxAgeMs = config.maxTestDataAgeHours * 60 * 60 * 1000;
  return Date.now() - timestamp < maxAgeMs;
}

/**
 * Safety check before running destructive operations
 */
export function safetyCheck(operation: string): void {
  if (!allowDestructiveTests()) {
    throw new Error(
      `🚨 Safety check failed: ${operation} is not allowed in the current environment. ` +
        `Set E2E_ALLOW_DESTRUCTIVE_TESTS=true to override (NOT RECOMMENDED)`,
    );
  }
}

/**
 * Log safety information for debugging
 */
export function logSafetyInfo(): void {
  const config = getSafetyConfig();
  console.log('🔒 E2E Safety Configuration:');
  console.log(`  Environment: ${config.testEnv}`);
  console.log(`  Production: ${isProduction()}`);
  console.log(`  Destructive tests allowed: ${config.allowDestructiveTests}`);
  console.log(`  Test database prefix: ${config.testDatabasePrefix}`);
  console.log(`  Auto cleanup: ${config.autoCleanup}`);
  console.log(`  Cleanup on failure: ${config.cleanupOnFailure}`);
}

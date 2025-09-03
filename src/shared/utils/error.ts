// Centralized error reporting utilities

/**
 * Production-ready error reporting with easy swap for providers (e.g., Sentry)
 * Usage: import { report } from '@/utils/error'
 */
export const report = (err: unknown) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate Sentry or another APM: import * as Sentry from '@sentry/nextjs'; Sentry.captureException(err)
    // Keep console output for now until a provider is wired

    console.error('Production error (Sentry not configured):', err);
  } else {
    console.error(err);
  }
};

/**
 * Wraps a function and reports any thrown error before rethrowing
 */
export async function withErrorReporting<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    report(err);
    throw err;
  }
}

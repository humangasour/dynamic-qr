// Authentication utility functions
// Helper functions and constants used across auth operations

// (no local Database usage; types are re-exported from central types)

// Re-export role helpers from roles.ts to keep existing imports working
export { ROLE_ORDER, hasRolePermission, getHighestRole, isAdminRole, isOwnerRole } from './roles';

// Production-ready error reporting
export const report = (err: unknown) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: import * as Sentry from '@sentry/nextjs'; Sentry.captureException(err);
    console.error('Production error (Sentry not configured):', err);
  } else {
    console.error(err);
  }
};

// Re-export the MemberRole type from central types
export type { MemberRole } from '@/types/auth';

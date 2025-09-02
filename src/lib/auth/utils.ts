// Authentication utility functions
// Helper functions and constants used across auth operations

import type { Database } from '@/types';

// Role hierarchy for comparison (outside function for performance)
export const ROLE_ORDER = { viewer: 1, editor: 2, admin: 3, owner: 4 } as const;

// Production-ready error reporting
export const report = (err: unknown) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: import * as Sentry from '@sentry/nextjs'; Sentry.captureException(err);
    console.error('Production error (Sentry not configured):', err);
  } else {
    console.error(err);
  }
};

// Type for role comparison
export type MemberRole = Database['public']['Enums']['member_role_t'];

/**
 * Check if a user role has sufficient permissions for a required role
 */
export function hasRolePermission(userRole: MemberRole, requiredRole: MemberRole): boolean {
  return ROLE_ORDER[userRole] >= ROLE_ORDER[requiredRole];
}

/**
 * Get the highest role from a list of roles
 */
export function getHighestRole(roles: MemberRole[]): MemberRole {
  if (roles.length === 0) {
    return 'viewer';
  }
  return roles.reduce((highest, current) =>
    ROLE_ORDER[current] > ROLE_ORDER[highest] ? current : highest,
  );
}

/**
 * Check if a role is considered an admin role (admin or owner)
 */
export function isAdminRole(role: MemberRole): boolean {
  return role === 'admin' || role === 'owner';
}

/**
 * Check if a role is considered an owner role
 */
export function isOwnerRole(role: MemberRole): boolean {
  return role === 'owner';
}

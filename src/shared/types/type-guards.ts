// ===== Type Guards for Database Types
// Validation functions for runtime type checking
import type { PlanType, MemberRole, QRStatus } from './auth';
import { PLAN_TYPES, MEMBER_ROLES, QR_STATUSES } from './auth';

// ===== Validation Functions

/**
 * Check if a plan is valid
 */
export function isValidPlan(plan: string): plan is PlanType {
  return (PLAN_TYPES as readonly string[]).includes(plan);
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is MemberRole {
  return (MEMBER_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a QR status is valid
 */
export function isValidQRStatus(status: string): status is QRStatus {
  return (QR_STATUSES as readonly string[]).includes(status);
}

// ===== Constants from Generated Types

// Re-export canonical arrays (single source of truth lives in ./auth)
export { PLAN_TYPES, MEMBER_ROLES, QR_STATUSES };

// ===== Utility Functions

/**
 * Get display name for a plan
 */
export function getPlanDisplayName(plan: PlanType): string {
  const displayNames: Record<PlanType, string> = {
    free: 'Free Plan',
    pro: 'Pro Plan',
  };
  return displayNames[plan];
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: MemberRole): string {
  const displayNames: Record<MemberRole, string> = {
    owner: 'Owner',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return displayNames[role];
}

/**
 * Check if a role has admin privileges
 */
export function hasAdminPrivileges(role: MemberRole): boolean {
  return ['owner', 'admin'].includes(role);
}

/**
 * Check if a role can edit content
 */
export function canEditContent(role: MemberRole): boolean {
  return ['owner', 'admin', 'editor'].includes(role);
}

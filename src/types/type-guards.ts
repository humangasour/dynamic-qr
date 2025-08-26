// ===== Type Guards for Database Types
// Validation functions for runtime type checking

import type { Database } from './database';

// Extract types from the generated database types
export type PlanType = Database['public']['Enums']['plan_t'];
export type MemberRole = Database['public']['Enums']['member_role_t'];
export type QRStatus = Database['public']['Enums']['qr_status_t'];

// ===== Validation Functions

/**
 * Check if a plan is valid
 */
export function isValidPlan(plan: string): plan is PlanType {
  return ['free', 'pro'].includes(plan);
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is MemberRole {
  return ['owner', 'admin', 'editor', 'viewer'].includes(role);
}

/**
 * Check if a QR status is valid
 */
export function isValidQRStatus(status: string): status is QRStatus {
  return ['active', 'archived'].includes(status);
}

// ===== Constants from Generated Types

export const PLAN_TYPES: PlanType[] = ['free', 'pro'];
export const MEMBER_ROLES: MemberRole[] = ['owner', 'admin', 'editor', 'viewer'];
export const QR_STATUSES: QRStatus[] = ['active', 'archived'];

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

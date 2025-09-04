// Role utilities and permissions
import type { MemberRole } from '@shared/types/auth';

export const ROLE_ORDER = { viewer: 1, editor: 2, admin: 3, owner: 4 } as const;

export function hasRolePermission(userRole: MemberRole, requiredRole: MemberRole): boolean {
  return ROLE_ORDER[userRole] >= ROLE_ORDER[requiredRole];
}

export function getHighestRole(roles: MemberRole[]): MemberRole {
  if (roles.length === 0) return 'viewer';
  return roles.reduce((highest, current) =>
    ROLE_ORDER[current] > ROLE_ORDER[highest] ? current : highest,
  );
}

export function isAdminRole(role: MemberRole): boolean {
  return role === 'admin' || role === 'owner';
}

export function isOwnerRole(role: MemberRole): boolean {
  return role === 'owner';
}

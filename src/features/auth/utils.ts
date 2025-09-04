// Authentication utility functions
// Helper functions and constants used across auth operations

// (no local Database usage; types are re-exported from central types)

// Re-export role helpers from roles.ts to keep existing imports working
export { ROLE_ORDER, hasRolePermission, getHighestRole, isAdminRole, isOwnerRole } from './roles';

// Error reporting is now centralized in src/utils/error
export { report } from '@shared/utils/error';

// Re-export the MemberRole type from central types
export type { MemberRole } from '@shared/types/auth';

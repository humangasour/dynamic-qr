import { z } from 'zod';

import { memberRoleEnum } from './enums';

// Zod schema for simple RBAC checks input
export const requireRoleSchema = z.object({
  requiredRole: memberRoleEnum,
  userRole: memberRoleEnum,
});

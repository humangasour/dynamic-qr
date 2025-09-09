import { z } from 'zod';

import { planEnum, memberRoleEnum } from './enums';
import { Email, UUID } from './primitives';

// Organization name reusable validator
const orgName = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9\s\-_&.,()]+$/);

export const createOrganizationSchema = z.object({ name: orgName });

export const updateOrganizationSchema = z.object({
  name: orgName.optional(),
  plan: planEnum.optional(),
});

export const inviteMemberSchema = z.object({
  email: Email,
  role: memberRoleEnum,
});

export const updateMemberRoleSchema = z.object({
  userId: UUID,
  role: memberRoleEnum,
});

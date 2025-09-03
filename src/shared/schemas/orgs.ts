import { z } from 'zod';

import { planEnum, memberRoleEnum } from './enums';
import { Email, UUID } from './primitives';

// Organization name reusable validator
const orgName = z
  .string()
  .min(1, 'Organization name is required')
  .max(255, 'Organization name must be less than 255 characters')
  .regex(/^[a-zA-Z0-9\s\-_&.,()]+$/, 'Organization name contains invalid characters');

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

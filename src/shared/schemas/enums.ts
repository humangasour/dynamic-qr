import { z } from 'zod';

import { MEMBER_ROLES, PLAN_TYPES, type MemberRole, type PlanType } from '@shared/types/auth';

// Canonical Zod enums derived from central constants
export const planEnum = z.enum(PLAN_TYPES as unknown as [PlanType, ...PlanType[]]);
export const memberRoleEnum = z.enum(MEMBER_ROLES as unknown as [MemberRole, ...MemberRole[]]);

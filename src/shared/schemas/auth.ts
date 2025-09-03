import { z } from 'zod';

import { memberRoleEnum } from './enums';
import { UUID, Email } from './primitives';

/** ---------- Primitives ---------- */
// moved to shared primitives for reuse

/** ---------- DB-aligned entity schemas ---------- */
// moved to shared entities for reuse across modules

/** Returned by getCurrentUser (your server util) */
export const userWithOrgSchema = z.object({
  id: UUID,
  email: Email,
  name: z.string().min(1).max(255).nullable(), // be lenient: server can return null
  avatar_url: z.url().nullable(),
  org_id: UUID,
  org_name: z.string().min(1).max(255),
  org_role: memberRoleEnum,
});

// Inferred type for consumers to avoid duplicating interfaces
export type UserWithOrg = z.infer<typeof userWithOrgSchema>;

/** ---------- Auth flows ---------- */
export const signInSchema = z.object({
  email: Email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const strongPassword = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

const personName = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name must be less than 255 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const signUpSchema = z
  .object({
    email: Email,
    password: strongPassword,
    name: personName,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/** Magic link / OAuth (if you expose these) */
export const magicLinkSchema = z.object({
  email: Email,
  redirectTo: z.url().optional(),
});

export const oauthSchema = z.object({
  provider: z.enum(['github', 'google']),
  redirectTo: z.url().optional(),
});

/** ---------- Password reset ---------- */
export const forgotPasswordSchema = z.object({ email: Email });

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/** ---------- Profile ---------- */
export const updateProfileSchema = z.object({
  name: personName.optional(),
  avatar_url: z.url('Please enter a valid URL').nullable().optional(),
});

/** ---------- Organization mgmt ---------- */
/**
 * Organization and RBAC schemas were moved to dedicated modules:
 * - org schemas → src/shared/schemas/orgs.ts
 * - role input schema → src/shared/schemas/roles.ts
 * - http response schemas → src/shared/schemas/http.ts
 */

// src/lib/validation/schemas.ts
import { z } from 'zod';

/** ---------- Reusable enums ---------- */
export const planEnum = z.enum(['free', 'pro']);
export const memberRoleEnum = z.enum(['viewer', 'editor', 'admin', 'owner']);

/** ---------- Primitives ---------- */
const UUID = z.uuid();
const ISODateTime = z.string().datetime({ offset: true }); // Supabase timestamptz → ISO8601 with timezone
const Email = z.string().trim().toLowerCase().email();

/** ---------- DB-aligned entity schemas ---------- */
// Note: DB allows null name; reflect that here to avoid parse errors.
export const userSchema = z.object({
  id: UUID,
  email: Email,
  name: z.string().min(1).max(255).nullable(),
  avatar_url: z.url().nullable(),
  created_at: ISODateTime,
  updated_at: ISODateTime,
});

export const organizationSchema = z.object({
  id: UUID,
  name: z.string().min(1).max(255),
  plan: planEnum,
  stripe_customer_id: z.string().nullable(),
  created_at: ISODateTime,
  updated_at: ISODateTime,
});

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

/** ---------- Members ---------- */
export const inviteMemberSchema = z.object({
  email: Email,
  role: memberRoleEnum,
});

export const updateMemberRoleSchema = z.object({
  userId: UUID,
  role: memberRoleEnum,
});

/** ---------- RBAC helper ---------- */
export const requireRoleSchema = z.object({
  requiredRole: memberRoleEnum,
  userRole: memberRoleEnum,
});

/** ---------- API response shapes (thin) ---------- */
export const authResponseSchema = z.object({
  user: userSchema.nullable(),
  session: z
    .object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_in: z.number(),
      expires_at: z.number(),
      token_type: z.string(),
    })
    .nullable(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
});

/** ---------- Tiny helpers ---------- */
export const validateEmail = (email: string) => Email.safeParse(email).success;

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const r = strongPassword.safeParse(password);
  if (r.success) return { valid: true, errors: [] };
  const issues = r.error.issues.map((i) => i.message);
  // Ensure we always include the length message if that was the cause
  if (password.length < 8 && !issues.includes('Password must be at least 8 characters')) {
    issues.unshift('Password must be at least 8 characters');
  }
  return { valid: false, errors: Array.from(new Set(issues)) };
};

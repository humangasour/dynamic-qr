import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  ensureUserAndOrgInputSchema,
} from '@shared/schemas/auth';

describe('Auth Schemas', () => {
  describe('signInSchema', () => {
    it('accepts valid email and password', () => {
      const res = signInSchema.safeParse({ email: 'user@example.com', password: 'Password1' });
      expect(res.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const res = signInSchema.safeParse({ email: 'bad', password: 'Password1' });
      expect(res.success).toBe(false);
    });

    it('rejects short password', () => {
      const res = signInSchema.safeParse({ email: 'user@example.com', password: 'short' });
      expect(res.success).toBe(false);
    });
  });

  describe('signUpSchema', () => {
    it('accepts valid signup data', () => {
      const res = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        name: 'Jane Doe',
      });
      expect(res.success).toBe(true);
    });

    it("rejects when passwords don't match", () => {
      const res = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        confirmPassword: 'Password2',
        name: 'Jane Doe',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
      }
    });

    it('rejects weak password', () => {
      const res = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'password',
        confirmPassword: 'password',
        name: 'Jane Doe',
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid name characters', () => {
      const res = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        name: 'Jane @ Doe',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema/resetPasswordSchema', () => {
    it('accepts valid forgot password payload', () => {
      const res = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
      expect(res.success).toBe(true);
    });

    it('accepts valid reset password payload', () => {
      const res = resetPasswordSchema.safeParse({
        password: 'Password1',
        confirmPassword: 'Password1',
      });
      expect(res.success).toBe(true);
    });

    it('rejects mismatched reset password payload', () => {
      const res = resetPasswordSchema.safeParse({
        password: 'Password1',
        confirmPassword: 'Password2',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('accepts valid updates', () => {
      const res = updateProfileSchema.safeParse({
        name: 'Jane Doe',
        avatar_url: 'https://example.com/a.png',
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid url', () => {
      const res = updateProfileSchema.safeParse({
        name: 'Jane Doe',
        avatar_url: 'not-a-url' as unknown as z.infer<typeof updateProfileSchema>['avatar_url'],
      });
      expect(res.success).toBe(false);
    });
  });

  describe('ensureUserAndOrgInputSchema', () => {
    it('accepts name or undefined', () => {
      expect(ensureUserAndOrgInputSchema.safeParse({ userName: 'Jane' }).success).toBe(true);
      expect(ensureUserAndOrgInputSchema.safeParse({}).success).toBe(true);
    });

    it('ignores extraneous properties (non-strict schema)', () => {
      const res = ensureUserAndOrgInputSchema.safeParse({ userName: 'Jane', userId: 'bad' });
      expect(res.success).toBe(true);
    });
  });
});

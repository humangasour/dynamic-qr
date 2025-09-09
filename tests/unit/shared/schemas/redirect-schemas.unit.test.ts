import { describe, it, expect } from 'vitest';

import { redirectInputSchema, redirectOutputSchema } from '@shared/schemas/redirect';

describe('Redirect Schemas', () => {
  describe('redirectInputSchema', () => {
    it('accepts minimal valid input (slug only) and optional fields when present', () => {
      const ok1 = redirectInputSchema.safeParse({ slug: 'abc' });
      expect(ok1.success).toBe(true);

      const ok2 = redirectInputSchema.safeParse({
        slug: 'my-slug',
        ip: '127.0.0.1',
        userAgent: 'UA',
        referrer: 'https://example.com',
        country: 'US',
      });
      expect(ok2.success).toBe(true);
      if (ok2.success) {
        expect(ok2.data.slug).toBe('my-slug');
      }
    });

    it('requires non-empty slug with max length 255', () => {
      const missing = redirectInputSchema.safeParse({});
      expect(missing.success).toBe(false);
      if (!missing.success) {
        expect(missing.error.issues.some((i) => i.path.join('.') === 'slug')).toBe(true);
      }

      const empty = redirectInputSchema.safeParse({ slug: '' });
      expect(empty.success).toBe(false);

      const longSlug = 'a'.repeat(256);
      const tooLong = redirectInputSchema.safeParse({ slug: longSlug });
      expect(tooLong.success).toBe(false);
    });

    it('validates types of optional fields when provided', () => {
      const bad = redirectInputSchema.safeParse({
        slug: 'ok',
        ip: 123,
      } as unknown as Record<string, unknown>);
      expect(bad.success).toBe(false);
      if (!bad.success) {
        // Ensure error paths include the offending key
        expect(bad.error.issues.some((i) => i.path.join('.') === 'ip')).toBe(true);
      }
    });
  });

  describe('redirectOutputSchema', () => {
    it('accepts valid output (targetUrl string or null)', () => {
      const ok1 = redirectOutputSchema.safeParse({
        success: true,
        targetUrl: 'https://x',
        slug: 's',
      });
      expect(ok1.success).toBe(true);
      const ok2 = redirectOutputSchema.safeParse({ success: false, targetUrl: null, slug: 's' });
      expect(ok2.success).toBe(true);
    });

    it('rejects invalid types for fields', () => {
      const badSuccess = redirectOutputSchema.safeParse({
        success: 'yes',
        targetUrl: null,
        slug: 's',
      } as unknown as Record<string, unknown>);
      expect(badSuccess.success).toBe(false);

      const badTarget = redirectOutputSchema.safeParse({
        success: true,
        targetUrl: 123,
        slug: 's',
      } as unknown as Record<string, unknown>);
      expect(badTarget.success).toBe(false);

      const badSlug = redirectOutputSchema.safeParse({
        success: true,
        targetUrl: 'u',
        slug: 10,
      } as unknown as Record<string, unknown>);
      expect(badSlug.success).toBe(false);
    });
  });
});

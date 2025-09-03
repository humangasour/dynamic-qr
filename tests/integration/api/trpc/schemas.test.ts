import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { redirectInputSchema, redirectOutputSchema } from '@shared/schemas';

describe('tRPC Schema Validation', () => {
  describe('Redirect Input Schema', () => {
    it('should validate valid input', () => {
      const validInput = {
        slug: 'test-slug',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://example.com',
        country: 'US',
      };

      const result = redirectInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate input with only required fields', () => {
      const minimalInput = {
        slug: 'test-slug',
      };

      const result = redirectInputSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty slug', () => {
      const invalidInput = {
        slug: '',
      };

      const result = redirectInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Slug is required');
      }
    });

    it('should reject slug that is too long', () => {
      const invalidInput = {
        slug: 'a'.repeat(256),
      };

      const result = redirectInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Slug too long');
      }
    });

    it('should reject missing slug', () => {
      const invalidInput = {};

      const result = redirectInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should handle optional parameters correctly', () => {
      const inputWithOptionals = {
        slug: 'test-slug',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://example.com',
        country: 'US',
      };

      const result = redirectInputSchema.safeParse(inputWithOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe('Redirect Output Schema', () => {
    it('should validate successful output', () => {
      const validOutput = {
        success: true,
        targetUrl: 'https://example.com',
        slug: 'test-slug',
      };

      const result = redirectOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should validate output with null targetUrl', () => {
      const validOutput = {
        success: true,
        targetUrl: null,
        slug: 'test-slug',
      };

      const result = redirectOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid output structure', () => {
      const invalidOutput = {
        success: 'true', // Should be boolean
        targetUrl: 'https://example.com',
        slug: 'test-slug',
      };

      const result = redirectOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidOutput = {
        success: true,
        // Missing targetUrl and slug
      };

      const result = redirectOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Type Inference', () => {
    it('should provide correct TypeScript types', () => {
      // This test ensures the schema types are correctly inferred
      const input: z.infer<typeof redirectInputSchema> = {
        slug: 'test-slug',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://example.com',
        country: 'US',
      };

      const output: z.infer<typeof redirectOutputSchema> = {
        success: true,
        targetUrl: 'https://example.com',
        slug: 'test-slug',
      };

      expect(input.slug).toBe('test-slug');
      expect(output.success).toBe(true);
    });
  });
});

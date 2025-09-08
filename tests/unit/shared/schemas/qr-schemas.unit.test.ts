import { describe, it, expect } from 'vitest';

import {
  createQrInputSchema,
  createQrOutputSchema,
  getQrByIdInputSchema,
  getQrByIdOutputSchema,
} from '@shared/schemas/qr';

describe('QR Schemas', () => {
  describe('createQrInputSchema', () => {
    it('accepts valid input', () => {
      const input = { name: 'My QR', targetUrl: 'https://example.com' };
      const result = createQrInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
      const input = { name: '', targetUrl: 'https://example.com' };
      const result = createQrInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects non-http(s) URLs', () => {
      const input = { name: 'X', targetUrl: 'ftp://example.com' };
      const result = createQrInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects invalid URL', () => {
      const input = { name: 'X', targetUrl: 'not-a-url' };
      const result = createQrInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('createQrOutputSchema', () => {
    it('validates expected output shape', () => {
      const output = {
        success: true,
        id: 'abc',
        name: 'My QR',
        targetUrl: 'https://example.com',
        slug: 'slug-1',
        svgUrl: 'https://cdn/svg',
        pngUrl: 'https://cdn/png',
      };
      const result = createQrOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });

  describe('getQrById schemas', () => {
    it('accepts valid UUID input', () => {
      const input = { id: '123e4567-e89b-12d3-a456-426614174000' };
      const result = getQrByIdInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID input', () => {
      const input = { id: 'not-a-uuid' };
      const result = getQrByIdInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('validates getById output shape', () => {
      const output = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'QR Name',
        targetUrl: 'https://example.com',
        slug: 'slug',
        svgUrl: 'https://cdn/svg',
        pngUrl: 'https://cdn/png',
      };
      const result = getQrByIdOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });
});

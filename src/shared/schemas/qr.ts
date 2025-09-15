import { z } from 'zod';

import { UUID } from './primitives';
import { ISODateTime } from './primitives';

/**
 * Schema for QR code creation input validation
 */
export const createQrInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name too long'),
  targetUrl: z
    .string()
    .url('Please enter a valid URL')
    .trim()
    .refine(
      (u) => u.startsWith('http://') || u.startsWith('https://'),
      'Only http(s) URLs allowed',
    ),
});

/**
 * Type inference for QR creation input
 */
export type CreateQrInput = z.infer<typeof createQrInputSchema>;

/**
 * Schema for QR code creation output
 */
export const createQrOutputSchema = z.object({
  success: z.boolean(),
  id: z.string(),
  name: z.string(),
  targetUrl: z.string(),
  slug: z.string(),
  svgUrl: z.string(),
  pngUrl: z.string(),
});

/**
 * Type inference for QR creation output
 */
export type CreateQrOutput = z.infer<typeof createQrOutputSchema>;

/**
 * Schema for fetching a QR code by ID
 */
export const getQrByIdInputSchema = z.object({
  id: UUID,
});

export const getQrByIdOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetUrl: z.string(),
  slug: z.string(),
  svgUrl: z.string(),
  pngUrl: z.string(),
});

export type GetQrByIdInput = z.infer<typeof getQrByIdInputSchema>;
export type GetQrByIdOutput = z.infer<typeof getQrByIdOutputSchema>;

/**
 * Schema for listing QRs with cursor-based pagination
 */
export const listQrInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().nullish(), // encoded as "{updated_at}|{id}"
});

const listQrItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  svgUrl: z.string(),
  current_target_url: z.string(),
  versionCount: z.number().int(),
  weekScans: z.number().int(),
  updated_at: ISODateTime,
});

export const listQrOutputSchema = z.object({
  items: z.array(listQrItemSchema),
  nextCursor: z.string().nullable(),
  totalCount: z.number().int(),
});

export type ListQrInput = z.infer<typeof listQrInputSchema>;
export type ListQrOutput = z.infer<typeof listQrOutputSchema>;

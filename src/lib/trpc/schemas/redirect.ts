import { z } from 'zod';

/**
 * Schema for redirect procedure input validation
 */
export const redirectInputSchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Type inference for redirect input
 */
export type RedirectInput = z.infer<typeof redirectInputSchema>;

/**
 * Schema for redirect procedure output
 */
export const redirectOutputSchema = z.object({
  success: z.boolean(),
  targetUrl: z.string().nullable(),
  slug: z.string(),
});

/**
 * Type inference for redirect output
 */
export type RedirectOutput = z.infer<typeof redirectOutputSchema>;

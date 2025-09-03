import { z } from 'zod';

import { userSchema } from './entities';

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

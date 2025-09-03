import { z } from 'zod';

import { UUID, ISODateTime, Email } from '../primitives';

// DB-aligned user entity schema
export const userSchema = z.object({
  id: UUID,
  email: Email,
  name: z.string().min(1).max(255).nullable(),
  avatar_url: z.url().nullable(),
  created_at: ISODateTime,
  updated_at: ISODateTime,
});

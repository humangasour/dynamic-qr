import { z } from 'zod';

import { UUID, ISODateTime } from '../primitives';
import { planEnum } from '../enums';

// DB-aligned organization entity schema
export const organizationSchema = z.object({
  id: UUID,
  name: z.string().min(1).max(255),
  plan: planEnum,
  stripe_customer_id: z.string().nullable(),
  created_at: ISODateTime,
  updated_at: ISODateTime,
});

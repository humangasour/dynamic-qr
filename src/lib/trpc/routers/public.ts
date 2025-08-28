import { createTRPCRouter } from '@/lib/trpc/trpc';

import { redirectRouter } from './redirect';

/**
 * Public router containing all public (unauthenticated) procedures
 */
export const publicRouter = createTRPCRouter({
  /**
   * Redirect-related procedures
   */
  redirect: redirectRouter,
});

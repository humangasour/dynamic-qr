import { createTRPCRouter } from '../trpc';

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

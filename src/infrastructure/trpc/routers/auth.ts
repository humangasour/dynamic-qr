import { TRPCError } from '@trpc/server';

import { ensureUserAndOrg } from '@/features/auth/server';
import { ensureUserAndOrgInputSchema, ensureUserAndOrgOutputSchema } from '@shared/schemas/auth';

import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * Auth router containing authentication-related procedures
 */
export const authRouter = createTRPCRouter({
  /**
   * Ensure user and organization setup after signup
   */
  ensureUserAndOrg: protectedProcedure
    .input(ensureUserAndOrgInputSchema)
    .output(ensureUserAndOrgOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = ctx.user;
        if (!user.email) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const orgId = await ensureUserAndOrg(user.id, user.email, input.userName);

        return {
          success: true,
          orgId,
        };
      } catch (error) {
        console.error('Error ensuring user and org:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set up user and organization',
        });
      }
    }),
});

import { createTRPCRouter, publicProcedure } from '@/lib/trpc/trpc';
import { redirectInputSchema } from '@/schemas';

/**
 * Redirect router containing all redirect-related procedures
 */
export const redirectRouter = createTRPCRouter({
  /**
   * Handle redirect for a QR code slug
   * This procedure calls the Supabase RPC function to handle the redirect logic
   */
  handle: publicProcedure.input(redirectInputSchema).query(async ({ input, ctx }) => {
    const { slug, ip, userAgent, referrer, country } = input;

    try {
      // Call the Supabase RPC function
      const { data, error } = await ctx.supabase.rpc('handle_redirect', {
        p_slug: slug,
        p_ip: ip ?? '',
        p_user_agent: userAgent ?? '',
        p_referrer: referrer ?? '',
        p_country: country ?? '',
      });

      if (error) {
        console.error('Redirect RPC error:', error);
        throw new Error(`Failed to process redirect: ${error.message}`);
      }

      // The RPC function returns an array of objects with target_url
      const result = data as { target_url: string }[] | null;
      const targetUrl = result && result.length > 0 ? result[0]?.target_url : null;

      return {
        success: true,
        targetUrl,
        slug,
      };
    } catch (error) {
      console.error('Redirect procedure error:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }),
});

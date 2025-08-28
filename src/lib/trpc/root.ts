import { createTRPCRouter } from '@/lib/trpc/trpc';
import { publicRouter } from '@/lib/trpc/routers/public';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  public: publicRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

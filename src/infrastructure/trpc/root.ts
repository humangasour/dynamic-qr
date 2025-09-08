import { createTRPCRouter } from './trpc';
import { publicRouter } from './routers/public';
import { authRouter } from './routers/auth';
import { qrRouter } from './routers/qr';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  public: publicRouter,
  auth: authRouter,
  qr: qrRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

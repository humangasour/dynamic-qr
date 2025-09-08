import { initTRPC, TRPCError } from '@trpc/server';
import type { User } from '@supabase/supabase-js';

import {
  getSupabaseServerClient,
  getSupabaseServerClientReadOnly,
} from '@infra/supabase/clients/server-client';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    supabase: opts.supabase,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async () => {
  // Create Supabase client for server-side operations
  const supabase = await getSupabaseServerClient();

  return createInnerTRPCContext({
    supabase,
  });
};

/**
 * Read-only context for Server Components to avoid cookie writes
 */
export const createTRPCContextReadOnly = async () => {
  const supabase = await getSupabaseServerClientReadOnly();
  return createInnerTRPCContext({ supabase });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURES (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * Adds a simple auth guard that ensures a Supabase user exists.
 */
export type AuthedUser = User;

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const {
    data: { user },
    error,
  } = await ctx.supabase.auth.getUser();

  if (error) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message });
  }

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    } as TRPCContext & { user: AuthedUser },
  });
});

export const protectedProcedure = t.procedure.use(authMiddleware);

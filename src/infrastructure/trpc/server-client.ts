import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

import { type AppRouter } from './root';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/trpc`,
    }),
  ],
});

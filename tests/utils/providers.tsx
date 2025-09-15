import React, { PropsWithChildren, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { api } from '@/infrastructure/trpc/client';

export function TestProviders({ children }: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);
  const trpcClient = useMemo(
    () =>
      api.createClient({
        links: [
          {
            // Minimalistic link that throws if a test leaks real network calls
            prev: null,
            next: null,
            op: null as never,
          } as unknown as import('@trpc/client').TRPCLink<never>,
        ],
      }),
    [],
  );

  return (
    <api.Provider client={trpcClient} queryClient={client}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </api.Provider>
  );
}

export function withTestProviders(node: React.ReactElement) {
  return <TestProviders>{node}</TestProviders>;
}

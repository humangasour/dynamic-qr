import { createTRPCReact } from '@trpc/react-query';

import { type AppRouter } from '@/lib/trpc/root';

export const api = createTRPCReact<AppRouter>();

import { appRouter } from './root';
import { createTRPCContextReadOnly } from './trpc';

export async function getTrpcCallerReadOnly() {
  const ctx = await createTRPCContextReadOnly();
  return appRouter.createCaller(ctx);
}

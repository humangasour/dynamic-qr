import { describe } from 'vitest';

// Convenience helper to wrap a suite and skip entirely if DB isn't available
export async function describeIfDb(title: string, factory: () => void) {
  const available = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const d = available ? describe : describe.skip;
  d(title, factory);
}

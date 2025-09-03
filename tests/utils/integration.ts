import { describe } from 'vitest';
import type { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseAdminClient } from '@/lib/supabase/clients';

export async function isDbAvailable(): Promise<boolean> {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) return false;
    const { error } = await admin.from('orgs').select('id').limit(1);
    if (!error) return true;
    const code = (error as PostgrestError | null | undefined)?.code ?? '';
    const msg = (error as PostgrestError | null | undefined)?.message ?? '';
    // Known PostgREST or network errors when DB is unavailable
    if (code === 'PGRST301') return false;
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|Failed to fetch/i.test(msg)) return false;
    // Any other error: assume DB reachable but query failed
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|Failed to fetch/i.test(msg)) return false;
    return false;
  }
}

// Convenience helper to wrap a suite and skip entirely if DB isn't available
export async function describeIfDb(title: string, factory: () => void) {
  const available = await isDbAvailable();
  const d = available ? describe : describe.skip;
  d(title, factory);
}

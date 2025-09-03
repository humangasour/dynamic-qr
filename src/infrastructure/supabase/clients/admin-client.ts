// Admin client (for trusted backend jobs only)
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@shared/types';

let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (adminClient) return adminClient;

  adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' },
    },
  );

  return adminClient;
}

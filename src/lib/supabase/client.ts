// lib/supabase/client.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types';

// Singletons
let supabaseInstance: SupabaseClient<Database> | null = null;
let supabaseAdminInstance: SupabaseClient<Database> | null = null;

// Public client
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env');

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
  });
  return supabaseInstance;
};

// Admin client
export const getSupabaseAdminClient = (): SupabaseClient<Database> | null => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;

  supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  });
  return supabaseAdminInstance;
};

export const supabase = {
  get client(): SupabaseClient<Database> {
    return getSupabaseClient();
  },
};

export const supabaseAdmin = {
  get client(): SupabaseClient<Database> | null {
    return getSupabaseAdminClient();
  },
};

// Optional availability helpers
export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isAdminClientAvailable = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

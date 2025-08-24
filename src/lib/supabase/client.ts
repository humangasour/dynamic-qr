import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

// Helper function to get Supabase client (lazy initialization)
export const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

// Helper function to get Supabase admin client (lazy initialization)
export const getSupabaseAdminClient = () => {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseAdminInstance;
};

// Export the client getters (these won't throw at build time)
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  get from() {
    return getSupabaseClient().from;
  },
  get storage() {
    return getSupabaseClient().storage;
  },
  get functions() {
    return getSupabaseClient().functions;
  },
  get realtime() {
    return getSupabaseClient().realtime;
  },
  get rpc() {
    return getSupabaseClient().rpc;
  },
  get schema() {
    return getSupabaseClient().schema;
  },
};

// Export admin client getter
export const supabaseAdmin = {
  get auth() {
    const client = getSupabaseAdminClient();
    return client?.auth || null;
  },
  get from() {
    const client = getSupabaseAdminClient();
    return client?.from || null;
  },
  get storage() {
    const client = getSupabaseAdminClient();
    return client?.storage || null;
  },
  get functions() {
    const client = getSupabaseAdminClient();
    return client?.functions || null;
  },
  get realtime() {
    const client = getSupabaseAdminClient();
    return client?.realtime || null;
  },
  get rpc() {
    const client = getSupabaseAdminClient();
    return client?.rpc || null;
  },
  get schema() {
    const client = getSupabaseAdminClient();
    return client?.schema || null;
  },
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return Boolean(supabaseUrl && supabaseAnonKey);
  } catch {
    return false;
  }
};

// Helper function to check if admin client is available
export const isAdminClientAvailable = () => {
  try {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return Boolean(supabaseServiceRoleKey);
  } catch {
    return false;
  }
};

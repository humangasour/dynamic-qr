// Supabase client and utilities
export { supabase, supabaseAdmin, isSupabaseConfigured, isAdminClientAvailable } from './client';
export * from './utils';

// Server-side utilities (only import in server components or API routes)
export * from './server';

// Re-export commonly used types
export type { User, Session, AuthError } from '@supabase/supabase-js';

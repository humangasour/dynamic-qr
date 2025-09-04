// Supabase client and utilities
export * from './clients';
export * from './utils';
export * from './crud';

// Server-side utilities (only import in server components or API routes)
export * from './server';

// Re-export commonly used types
export type { User, Session, AuthError } from '@supabase/supabase-js';

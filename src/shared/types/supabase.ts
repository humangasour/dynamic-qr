// Supabase helper type aliases derived from generated Database
import type { Database } from './database';

export type TableName = keyof Database['public']['Tables'];
export type FunctionName = keyof Database['public']['Functions'];

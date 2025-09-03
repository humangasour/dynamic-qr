// Simplified Supabase utilities that work with the lazy client
import type { TableName } from '@shared/types';

import { getSupabaseBrowserClient } from './clients';
import { deleteRows, insertRows, selectRows, updateRows } from './crud';

export const db = {
  // Generic select function
  select: async <T>(
    table: TableName,
    columns: string = '*',
    filters?: Record<string, string | number | boolean>,
  ) => {
    const client = getSupabaseBrowserClient();
    return selectRows<T>(client, table, columns, filters);
  },

  // Generic insert function
  insert: async <T, TTable extends TableName>(
    table: TTable,
    data: import('@shared/types').Database['public']['Tables'][TTable]['Insert'],
  ) => {
    const client = getSupabaseBrowserClient();
    return insertRows<T, TTable>(client, table, data);
  },

  // Generic update function
  update: async <T, TTable extends TableName>(
    table: TTable,
    data: Partial<import('@shared/types').Database['public']['Tables'][TTable]['Update']>,
    filters: Record<string, string | number | boolean>,
  ) => {
    const client = getSupabaseBrowserClient();
    return updateRows<T, TTable>(client, table, data, filters);
  },

  // Generic delete function
  delete: async (table: TableName, filters: Record<string, string | number | boolean>) => {
    const client = getSupabaseBrowserClient();
    return deleteRows(client, table, filters);
  },
};

// Simple auth utilities
export const auth = {
  // Get current session
  getSession: async () => {
    const client = getSupabaseBrowserClient();
    return client.auth.getSession();
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    return client.auth.signInWithPassword({ email, password });
  },

  // Sign up
  signUp: async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    return client.auth.signUp({ email, password });
  },

  // Sign out
  signOut: async () => {
    const client = getSupabaseBrowserClient();
    return client.auth.signOut();
  },
};

// Storage utilities
export const storage = {
  // Upload file
  upload: async (bucket: string, path: string, file: File) => {
    const client = getSupabaseBrowserClient();
    return client.storage.from(bucket).upload(path, file);
  },

  // Download file
  download: async (bucket: string, path: string) => {
    const client = getSupabaseBrowserClient();
    return client.storage.from(bucket).download(path);
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const client = getSupabaseBrowserClient();
    return client.storage.from(bucket).getPublicUrl(path);
  },
};

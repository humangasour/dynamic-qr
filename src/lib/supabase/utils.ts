// Simplified Supabase utilities that work with the lazy client
import { getSupabaseClient } from './client';

export const db = {
  // Generic select function
  select: async <T>(
    table: string,
    columns: string = '*',
    filters?: Record<string, string | number | boolean>,
  ) => {
    const client = getSupabaseClient();
    let query = client.from(table).select(columns);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    return { data: data as T[], error };
  },

  // Generic insert function
  insert: async <T>(table: string, data: Partial<T>) => {
    const client = getSupabaseClient();
    const { data: result, error } = await client.from(table).insert(data).select();
    return { data: result as T[], error };
  },

  // Generic update function
  update: async <T>(
    table: string,
    data: Partial<T>,
    filters: Record<string, string | number | boolean>,
  ) => {
    const client = getSupabaseClient();
    let query = client.from(table).update(data);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();
    return { data: result as T[], error };
  },

  // Generic delete function
  delete: async (table: string, filters: Record<string, string | number | boolean>) => {
    const client = getSupabaseClient();
    let query = client.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },
};

// Simple auth utilities
export const auth = {
  // Get current session
  getSession: async () => {
    const client = getSupabaseClient();
    return client.auth.getSession();
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    const client = getSupabaseClient();
    return client.auth.signInWithPassword({ email, password });
  },

  // Sign up
  signUp: async (email: string, password: string) => {
    const client = getSupabaseClient();
    return client.auth.signUp({ email, password });
  },

  // Sign out
  signOut: async () => {
    const client = getSupabaseClient();
    return client.auth.signOut();
  },
};

// Storage utilities
export const storage = {
  // Upload file
  upload: async (bucket: string, path: string, file: File) => {
    const client = getSupabaseClient();
    return client.storage.from(bucket).upload(path, file);
  },

  // Download file
  download: async (bucket: string, path: string) => {
    const client = getSupabaseClient();
    return client.storage.from(bucket).download(path);
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const client = getSupabaseClient();
    return client.storage.from(bucket).getPublicUrl(path);
  },
};

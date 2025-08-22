import type { AuthError, RealtimeChannel } from '@supabase/supabase-js';

import { supabase, supabaseAdmin } from './client';

// Authentication helpers
export const auth = {
  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },
};

// Database helpers
export const db = {
  // Generic select function
  select: async <T>(table: string, columns: string = '*', filters?: Record<string, unknown>) => {
    let query = supabase.from(table).select(columns);

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
    const { data: result, error } = await supabase.from(table).insert(data).select();

    return { data: result as T[], error };
  },

  // Generic update function
  update: async <T>(table: string, data: Partial<T>, filters: Record<string, unknown>) => {
    let query = supabase.from(table).update(data);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();
    return { data: result as T[], error };
  },

  // Generic delete function
  delete: async (table: string, filters: Record<string, unknown>) => {
    let query = supabase.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },

  // Admin operations (bypass RLS)
  admin: {
    select: async <T>(table: string, columns: string = '*', filters?: Record<string, unknown>) => {
      if (!supabaseAdmin) {
        throw new Error(
          'Admin client not available. This operation requires server-side execution.',
        );
      }

      let query = supabaseAdmin.from(table).select(columns);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      return { data: data as T[], error };
    },

    insert: async <T>(table: string, data: Partial<T>) => {
      if (!supabaseAdmin) {
        throw new Error(
          'Admin client not available. This operation requires server-side execution.',
        );
      }

      const { data: result, error } = await supabaseAdmin.from(table).insert(data).select();

      return { data: result as T[], error };
    },

    update: async <T>(table: string, data: Partial<T>, filters: Record<string, unknown>) => {
      if (!supabaseAdmin) {
        throw new Error(
          'Admin client not available. This operation requires server-side execution.',
        );
      }

      let query = supabaseAdmin.from(table).update(data);

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: result, error } = await query.select();
      return { data: result as T[], error };
    },

    delete: async (table: string, filters: Record<string, unknown>) => {
      if (!supabaseAdmin) {
        throw new Error(
          'Admin client not available. This operation requires server-side execution.',
        );
      }

      let query = supabaseAdmin.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      return { data, error };
    },
  },
};

// Error handling helpers
export const handleSupabaseError = (error: AuthError | Error | unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }

  if (error && typeof error === 'object' && 'error_description' in error) {
    return (error as { error_description: string }).error_description;
  }

  return 'An unexpected error occurred';
};

// Real-time subscription helpers
export const realtime = {
  // Subscribe to table changes
  subscribe: () => {
    // Note: This is a simplified version to avoid type issues
    // For production use, implement proper realtime subscriptions
    console.warn('Realtime subscriptions are simplified in this version');
    return null;
  },

  // Unsubscribe from channel
  unsubscribe: (channel: RealtimeChannel | null) => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  },
};

// Storage helpers
export const storage = {
  // Upload file
  upload: async (
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean },
  ) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, options);

    return { data, error };
  },

  // Download file
  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);

    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete file
  delete: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    return { data, error };
  },
};

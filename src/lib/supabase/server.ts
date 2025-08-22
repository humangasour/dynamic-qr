// Server-side Supabase utilities
// This file should only be imported in server components or API routes

import { supabaseAdmin, isAdminClientAvailable } from './client';

// Server-side database operations that bypass RLS
export const serverDb = {
  // Generic select function
  select: async <T>(table: string, columns: string = '*', filters?: Record<string, unknown>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    let query = supabaseAdmin!.from(table).select(columns);

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
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data: result, error } = await supabaseAdmin!.from(table).insert(data).select();
    return { data: result as T[], error };
  },

  // Generic update function
  update: async <T>(table: string, data: Partial<T>, filters: Record<string, unknown>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    let query = supabaseAdmin!.from(table).update(data);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();
    return { data: result as T[], error };
  },

  // Generic delete function
  delete: async (table: string, filters: Record<string, unknown>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    let query = supabaseAdmin!.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },

  // Execute raw SQL (use with caution)
  rpc: async <T>(functionName: string, params?: Record<string, unknown>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await supabaseAdmin!.rpc(functionName, params);
    return { data: data as T, error };
  },
};

// Server-side auth operations
export const serverAuth = {
  // Get user by ID
  getUserById: async (userId: string) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await supabaseAdmin!.auth.admin.getUserById(userId);
    return { data, error };
  },

  // Update user
  updateUser: async (userId: string, attributes: Record<string, unknown>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await supabaseAdmin!.auth.admin.updateUserById(userId, attributes);
    return { data, error };
  },

  // Delete user
  deleteUser: async (userId: string) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await supabaseAdmin!.auth.admin.deleteUser(userId);
    return { data, error };
  },
};

// Server-side Supabase utilities
// This file should only be imported in server components or API routes

import type { Database } from '@/types';

import { getSupabaseAdminClient, isAdminClientAvailable } from './clients';

type TableName = keyof Database['public']['Tables'];
type FunctionName = keyof Database['public']['Functions'];

// Server-side database operations that bypass RLS
export const serverDb = {
  // Generic select function
  select: async <T>(
    table: TableName,
    columns: string = '*',
    filters?: Record<string, string | number | boolean>,
  ) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

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
  insert: async <T>(table: TableName, data: Database['public']['Tables'][TableName]['Insert']) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data: result, error } = await client.from(table).insert(data).select();
    return { data: result as T[], error };
  },

  // Generic update function
  update: async <T>(
    table: TableName,
    data: Partial<Database['public']['Tables'][TableName]['Update']>,
    filters: Record<string, string | number | boolean>,
  ) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    let query = client.from(table).update(data);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select();
    return { data: result as T[], error };
  },

  // Generic delete function
  delete: async (table: TableName, filters: Record<string, string | number | boolean>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    let query = client.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    return { data, error };
  },

  // Execute raw SQL (use with caution)
  rpc: async <T, F extends FunctionName>(
    functionName: F,
    params?: Database['public']['Functions'][F]['Args'],
  ) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await client.rpc(functionName, params);
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

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await client.auth.admin.getUserById(userId);
    return { data, error };
  },

  // Update user
  updateUser: async (userId: string, attributes: Record<string, unknown>) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await client.auth.admin.updateUserById(userId, attributes);
    return { data, error };
  },

  // Delete user
  deleteUser: async (userId: string) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const { data, error } = await client.auth.admin.deleteUser(userId);
    return { data, error };
  },
};

// Server-side Supabase utilities
// This file should only be imported in server components or API routes

import type { Database, TableName, FunctionName } from '@/types';

import { getSupabaseAdminClient, isAdminClientAvailable } from './clients';
import { deleteRows, insertRows, selectRows, updateRows } from './crud';

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

    return selectRows<T>(client, table, columns, filters);
  },

  // Generic insert function
  insert: async <T, TTable extends TableName>(
    table: TTable,
    data: Database['public']['Tables'][TTable]['Insert'],
  ) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    return insertRows<T, TTable>(client, table, data);
  },

  // Generic update function
  update: async <T, TTable extends TableName>(
    table: TTable,
    data: Partial<Database['public']['Tables'][TTable]['Update']>,
    filters: Record<string, string | number | boolean>,
  ) => {
    if (!isAdminClientAvailable()) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin client not available. This function must be called server-side.');
    }

    return updateRows<T, TTable>(client, table, data, filters);
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

    return deleteRows(client, table, filters);
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

// Generic CRUD utilities that work with any provided Supabase client
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import type { Database, TableName } from '@/types';

type Filter = Record<string, string | number | boolean>;

// Minimal builder shapes to avoid strict generic coupling with Supabase's internal types
type InsertBuilder<TValues> = {
  insert: (values: TValues) => {
    select: () => Promise<{ data: unknown; error: PostgrestError | null }>;
  };
};

type UpdateFilterBuilder = {
  eq: (column: string, value: string | number | boolean) => UpdateFilterBuilder;
  select: () => Promise<{ data: unknown; error: PostgrestError | null }>;
};

type UpdateBuilder<TValues> = {
  update: (values: TValues) => UpdateFilterBuilder;
};

type DeleteFilterBuilder = {
  eq: (column: string, value: string | number | boolean) => DeleteFilterBuilder;
};

type DeleteBuilder = {
  delete: () => DeleteFilterBuilder & Promise<{ data: unknown; error: PostgrestError | null }>;
};

export async function selectRows<T>(
  client: SupabaseClient<Database>,
  table: TableName,
  columns: string = '*',
  filters?: Filter,
): Promise<{ data: T[]; error: PostgrestError | null }> {
  let query = client.from(table).select(columns);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;
  return { data: data as unknown as T[], error };
}

export async function insertRows<T, TTable extends TableName>(
  client: SupabaseClient<Database>,
  table: TTable,
  data: Database['public']['Tables'][TTable]['Insert'],
): Promise<{ data: T[]; error: PostgrestError | null }> {
  const from = client.from(table) as unknown as InsertBuilder<
    Database['public']['Tables'][TTable]['Insert']
  >;
  const { data: result, error } = await from.insert(data).select();
  return { data: result as unknown as T[], error };
}

export async function updateRows<T, TTable extends TableName>(
  client: SupabaseClient<Database>,
  table: TTable,
  data: Partial<Database['public']['Tables'][TTable]['Update']>,
  filters: Filter,
): Promise<{ data: T[]; error: PostgrestError | null }> {
  const from = client.from(table) as unknown as UpdateBuilder<
    Partial<Database['public']['Tables'][TTable]['Update']>
  >;
  let query = from.update(data);

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data: result, error } = await query.select();
  return { data: result as unknown as T[], error };
}

export async function deleteRows(
  client: SupabaseClient<Database>,
  table: TableName,
  filters: Filter,
): Promise<{ data: unknown; error: PostgrestError | null }> {
  const from = client.from(table) as unknown as DeleteBuilder;
  const built = from.delete();
  let filterBuilder: DeleteFilterBuilder = built;

  Object.entries(filters).forEach(([key, value]) => {
    filterBuilder = filterBuilder.eq(key, value);
  });

  const { data, error } = await (built as Promise<{
    data: unknown;
    error: PostgrestError | null;
  }>);
  return { data, error };
}

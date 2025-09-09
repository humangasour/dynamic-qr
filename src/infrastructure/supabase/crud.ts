// Generic CRUD utilities that work with any provided Supabase client
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

import type { Database, TableName } from '@shared/types';

type Filter = Record<string, string | number | boolean>;

// Minimal builder shapes to avoid strict generic coupling with Supabase's internal types
interface InsertBuilder<TValues> {
  insert: (values: TValues) => {
    select: () => Promise<{ data: unknown; error: PostgrestError | null }>;
  };
}

interface UpdateFilterBuilder {
  eq: (column: string, value: string | number | boolean) => UpdateFilterBuilder;
  select: () => Promise<{ data: unknown; error: PostgrestError | null }>;
}

interface UpdateBuilder<TValues> {
  update: (values: TValues) => UpdateFilterBuilder;
}

// (DeleteFilterBuilder removed to avoid unused type)

export async function selectRows<T>(
  client: SupabaseClient<Database>,
  table: TableName,
  columns: string = '*',
  filters?: Filter,
) {
  let builder = client.from(table).select(columns);
  if (filters) {
    for (const [column, value] of Object.entries(filters)) {
      builder = builder.eq(column, value);
    }
  }
  const { data, error } = await builder;
  if (error) throw error;
  return data as T[];
}

export async function insertRows<T, TTable extends TableName>(
  client: SupabaseClient<Database>,
  table: TTable,
  data: Database['public']['Tables'][TTable]['Insert'],
) {
  const builder = (
    client.from(table) as unknown as InsertBuilder<Database['public']['Tables'][TTable]['Insert']>
  )
    .insert(data)
    .select();
  const { data: result, error } = await builder;
  if (error) throw error;
  return result as T[];
}

export async function updateRows<T, TTable extends TableName>(
  client: SupabaseClient<Database>,
  table: TTable,
  data: Partial<Database['public']['Tables'][TTable]['Update']>,
  filters: Filter,
) {
  let builder = (
    client.from(table) as unknown as UpdateBuilder<
      Partial<Database['public']['Tables'][TTable]['Update']>
    >
  ).update(data);
  for (const [column, value] of Object.entries(filters)) {
    builder = builder.eq(column, value);
  }
  const { data: result, error } = await builder.select();
  if (error) throw error;
  return result as T[];
}

export async function deleteRows(
  client: SupabaseClient<Database>,
  table: TableName,
  filters: Filter,
) {
  let builder = client.from(table).delete();
  for (const [column, value] of Object.entries(filters)) {
    builder = builder.eq(column, value);
  }
  const { data, error } = await builder;
  if (error) throw error;
  return data;
}

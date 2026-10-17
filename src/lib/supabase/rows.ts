import type { createClient } from "@/lib/supabase/client";

export type SupabaseClient = ReturnType<typeof createClient>;

/** Select every row of a table, normalising a single object into a one-row list. */
type SelectAllOptions = {
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
};

export async function selectAll(
  supabase: SupabaseClient,
  table: string,
  options: SelectAllOptions = {},
) {
  const { limit = 1000, orderBy, ascending = true } = options;
  let query = supabase.from(table).select("*");
  if (orderBy) query = query.order(orderBy, { ascending });
  if (limit > 0) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") return [data as Record<string, unknown>];
  return [];
}

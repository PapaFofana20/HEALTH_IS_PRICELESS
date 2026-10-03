import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DbTable {
  name: string;
  rows: Record<string, unknown>[];
  error: string | null;
}

const ALLOWED_TABLES = ['profiles', 'orders', 'admin_emails', 'programs'] as const;
export type DbTableName = (typeof ALLOWED_TABLES)[number];

/** Lit une table entière autorisée (limitée à 200 lignes) en vue admin. */
export async function fetchDbTable(name: DbTableName): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from(name).select('*').limit(200);
  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[] | null) ?? [];
}

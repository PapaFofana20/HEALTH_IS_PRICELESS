import { createClient } from '@supabase/supabase-js';

/* ==========================================================
   Supabase client (projet HEALTH IS PRICELESS).
   Configure via variables d'environnement (voir .env.example
   à la racine) : VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
   Tant que la clé est absente, `supabase` vaut null et l'app
   continue en mode local (données mock + localStorage).
   ========================================================== */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url as string, anonKey as string) : null;

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(`[auth] mode: ${isSupabaseConfigured ? 'supabase' : 'mock (VITE_SUPABASE_* manquantes — redémarre le serveur dev)'}`);
  if (isSupabaseConfigured) {
    console.warn('[auth] WARNING: Supabase anon key is exposed in client. Ensure RLS policies are properly configured!');
  }
}

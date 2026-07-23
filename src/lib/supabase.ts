import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client (server-side only — uses service role key).
 * Returns null if Supabase is not configured, so callers can fall back
 * to local storage.
 */
let _client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    _client = null;
    return null;
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_KEY
  );
}

export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "indigate-uploads";

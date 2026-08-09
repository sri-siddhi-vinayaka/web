import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your Supabase project's values."
  );
}

/**
 * Anon-key client — safe in Server Components (fetching public rows at
 * render time) and Client Components alike. RLS policies, not this key,
 * are what keep data safe: never use the service role key here.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

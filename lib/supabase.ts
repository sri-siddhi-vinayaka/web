import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your Supabase project's values.";

  // Fail loud in production — a deployed app silently serving empty pages is
  // worse than a crash. In local dev, warn and fall back to a placeholder
  // client instead: reads simply fail (caught in lib/events.ts, degrading
  // pages to their empty state) rather than crashing every page at import.
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[lib/supabase] ${message}`);
}

// Callers (lib/events.ts, app/actions/register.ts) check this and skip the
// query entirely when unconfigured, rather than let it hang on a real DNS
// lookup against the placeholder host below before failing.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Anon-key client — safe in Server Components (fetching public rows at
 * render time) and Client Components alike. RLS policies, not this key,
 * are what keep data safe: never use the service role key here.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.invalid",
  supabaseAnonKey || "placeholder-anon-key"
);

import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  const message =
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. These are required for /admin.";

  // Same fail-loud-in-production / warn-and-fall-back-in-dev split as
  // lib/supabase.ts — see that file's comment for the reasoning. In
  // practice the admin login always rejects without ADMIN_PASSWORD (see
  // lib/adminAuth.ts) before this client's queries would ever run in dev.
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[lib/supabaseAdmin] ${message}`);
}

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

/**
 * Service-role client — bypasses RLS entirely. The `import "server-only"`
 * above makes importing this file from a "use client" component a build
 * error, not just a convention: never let this key reach the browser bundle.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.invalid",
  serviceRoleKey || "placeholder-service-role-key",
  { auth: { persistSession: false } }
);

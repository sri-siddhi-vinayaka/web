import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Same fail-soft posture as lib/events.ts: a Supabase hiccup degrades this to
// an empty list, never a 500.
function logAndFallback<T>(context: string, error: { message: string }, fallback: T): T {
  console.warn(`[lib/food] ${context}:`, error.message);
  return fallback;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 800,
  context: string = "query"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${context} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Goes through the claimed_dishes(event_id) RPC (see
// supabase/migrations/20260911235445_registration_refinements.sql) rather than
// `select dish_name from food_registrations` — there is no public SELECT
// policy on food_registrations (it holds the contact's name and phone
// number), so a direct query would be blocked by RLS. The RPC is a SECURITY
// DEFINER function that returns only the dish names, scoped to one day of
// the festival so a dish claimed on a different day doesn't show as taken.
export async function getClaimedDishes(eventId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await withTimeout(
      supabase.rpc("claimed_dishes", { p_event_id: eventId }) as unknown as Promise<{
        data: { dish_name: string }[] | null;
        error: { message: string } | null;
      }>,
      800,
      "getClaimedDishes"
    );

    if (error) return logAndFallback("getClaimedDishes", error, []);
    return (data ?? []).map((row) => row.dish_name);
  } catch (e) {
    return logAndFallback("getClaimedDishes", e as { message: string }, []);
  }
}

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { FESTIVAL_START } from "@/lib/config";
import type { Announcement, EventItem, GalleryItem } from "@/types";

// A Supabase hiccup should degrade a page (empty list / zero count), never
// 500 it — this is a $0-budget volunteer project with nobody paged at 2am.
// console.warn (not .error) deliberately: Next's dev overlay promotes
// console.error into a blocking full-screen "Console Error", which would
// misrepresent this already-handled, non-fatal fallback as a crash.
function logAndFallback<T>(context: string, error: { message: string }, fallback: T): T {
  console.warn(`[lib/events] ${context}:`, error.message);
  return fallback;
}

// Wrap any async operation with a timeout. Placeholder Supabase URLs (and
// genuine network hangs) can stall indefinitely; fail fast instead of blocking
// renders. This call is server-to-server (Vercel function to Supabase), not
// subject to the visitor's mobile connection, so a real project replies in
// well under a second — 800ms leaves margin without making every placeholder
// load feel sluggish.
function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 800,
  context: string = "query"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${context} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

export async function getEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("events")
        .select("*")
        .order("day_number", { ascending: true })
        .order("start_time", { ascending: true }) as unknown as Promise<{ data: EventItem[] | null; error: { message: string } | null }>,
      800,
      "getEvents"
    );

    if (error) return logAndFallback("getEvents", error, []);
    return data ?? [];
  } catch (e) {
    return logAndFallback("getEvents", e as { message: string }, []);
  }
}

export async function getEventById(id: string): Promise<EventItem | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await withTimeout(
      supabase.from("events").select("*").eq("id", id).maybeSingle() as unknown as Promise<{ data: EventItem | null; error: { message: string } | null }>,
      800,
      "getEventById"
    );

    if (error) return logAndFallback("getEventById", error, null);
    return data;
  } catch (e) {
    return logAndFallback("getEventById", e as { message: string }, null);
  }
}

// The venue is in Henrico, VA — anchor "today" to Eastern time regardless of
// where this function runs (Vercel's server clock is UTC), rather than the
// server's local date. Using the IANA zone name (not a fixed offset) means
// this automatically tracks the EDT/EST transition.
const FESTIVAL_TIME_ZONE = "America/New_York";

function calendarDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: FESTIVAL_TIME_ZONE });
}

export function getTodayHighlights(events: EventItem[], now: Date = new Date()): EventItem[] {
  const dayNumber =
    Math.round(
      (new Date(calendarDateKey(now)).getTime() -
        new Date(calendarDateKey(FESTIVAL_START)).getTime()) /
        86_400_000
    ) + 1;

  return events.filter((event) => event.day_number === dayNumber);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false }) as unknown as Promise<{ data: Announcement[] | null; error: { message: string } | null }>,
      800,
      "getAnnouncements"
    );

    if (error) return logAndFallback("getAnnouncements", error, []);
    return data ?? [];
  } catch (e) {
    return logAndFallback("getAnnouncements", e as { message: string }, []);
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false }) as unknown as Promise<{ data: GalleryItem[] | null; error: { message: string } | null }>,
      800,
      "getGalleryItems"
    );

    if (error) return logAndFallback("getGalleryItems", error, []);
    return data ?? [];
  } catch (e) {
    return logAndFallback("getGalleryItems", e as { message: string }, []);
  }
}

// Deliberately goes through the `registration_count` RPC (see
// supabase/migrations/20260911022120_registration_count_broadcast.sql) rather than
// `select count(*) from registrations` — there is no public SELECT policy on
// registrations (it holds every registrant's name and phone number), so a
// direct count query would be blocked by RLS. The RPC is a SECURITY DEFINER
// function that returns only the aggregate.
export async function getRegistrationCount(eventId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  try {
    const { data, error } = await withTimeout(
      supabase.rpc("registration_count", { p_event_id: eventId }) as unknown as Promise<{ data: number | null; error: { message: string } | null }>,
      800,
      "getRegistrationCount"
    );

    if (error) return logAndFallback("getRegistrationCount", error, 0);
    return data ?? 0;
  } catch (e) {
    return logAndFallback("getRegistrationCount", e as { message: string }, 0);
  }
}

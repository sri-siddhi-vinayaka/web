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

export async function getEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("day_number", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return logAndFallback("getEvents", error, []);
  return data ?? [];
}

export async function getEventById(id: string): Promise<EventItem | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (error) return logAndFallback("getEventById", error, null);
  return data;
}

// The festival's schedule is authored in IST regardless of where this
// function runs (Vercel's server clock is UTC) — anchor "today" to that
// timezone's calendar date rather than the server's local date.
const FESTIVAL_TIME_ZONE = "Asia/Kolkata";

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

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return logAndFallback("getAnnouncements", error, []);
  return data ?? [];
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return logAndFallback("getGalleryItems", error, []);
  return data ?? [];
}

// Deliberately goes through the `registration_count` RPC (see
// infra/migrations/0002_registration_count_broadcast.sql) rather than
// `select count(*) from registrations` — there is no public SELECT policy on
// registrations (it holds every registrant's name and phone number), so a
// direct count query would be blocked by RLS. The RPC is a SECURITY DEFINER
// function that returns only the aggregate.
export async function getRegistrationCount(eventId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;

  const { data, error } = await supabase.rpc("registration_count", { p_event_id: eventId });

  if (error) return logAndFallback("getRegistrationCount", error, 0);
  return data ?? 0;
}

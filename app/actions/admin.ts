"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPushToAllSubscribers } from "@/lib/webpush";
import {
  clearAdminCookie,
  isAdminRequest,
  setAdminCookie,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    redirect("/admin?error=1");
  }

  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin");
}

// A page-level check does not protect a Server Action — it's independently
// reachable by anyone who can construct the right POST request — so every
// mutation below re-checks authorization itself rather than trusting the
// caller to only render this form when logged in.
async function requireAdmin(): Promise<void> {
  if (!(await isAdminRequest())) {
    throw new Error("Not authorized.");
  }
}

export async function createAnnouncementAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  const { error } = await supabaseAdmin.from("announcements").insert({ title, body });
  revalidatePath("/admin");
  revalidatePath("/announcements");

  // Push, not the admin's own inbox — notifyAdmin() in lib/notify.ts is a
  // different direction entirely (visitor -> admin, "come review this
  // registration"). This is admin -> visitors, "something new is here."
  // No-ops quietly if VAPID keys aren't configured yet, same fail-soft
  // posture as everything else optional in this app.
  if (!error) {
    await sendPushToAllSubscribers(title, body, "/announcements");
  }
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("announcements").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/announcements");
}

export async function addGalleryItemAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!imageUrl) return;

  await supabaseAdmin
    .from("gallery_items")
    .insert({ image_url: imageUrl, caption: caption || null });
  revalidatePath("/admin");
  revalidatePath("/gallery");
}

export async function deleteGalleryItemAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("gallery_items").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/gallery");
}

export type CreateEventState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

// The <input type="datetime-local"> this backs gives a plain
// "YYYY-MM-DDTHH:mm" with no timezone — same simplification FESTIVAL_START/
// END already make in lib/config.ts: treat it as America/New_York and
// hardcode the EDT offset. Wrong for events entered after the fall-back to
// EST, same known limitation noted there. Shared by create and update
// below, which otherwise differ only in insert vs. update.
function parseEventForm(
  formData: FormData
):
  | {
      title: string;
      dayNumber: number;
      startTime: Date;
      description: string;
      flyerUrl: string | null;
      menu: string | null;
    }
  | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const dayNumber = Number(formData.get("day_number"));
  const startTimeLocal = String(formData.get("start_time") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  // Root-relative path into public/flyers/, same as the flyer_url column
  // itself (see supabase/migrations/20260916190000_add_event_flyer_url.sql)
  // — a plain pasted path, same UX as Gallery's image_url field, not a file
  // upload (no upload infra exists in this $0-budget app).
  const flyerUrl = String(formData.get("flyer_url") ?? "").trim() || null;
  // "Course name: item, item, item" per line — see
  // supabase/migrations/20260917234100_day5_anna_prasadam_menu.sql and
  // components/EventMenuButton.tsx, which parses this same format.
  const menu = String(formData.get("menu") ?? "").trim() || null;

  if (!title) return { error: "Title is required." };
  if (!Number.isInteger(dayNumber) || dayNumber < 1) {
    return { error: "Day # must be a whole number of 1 or more." };
  }
  if (!startTimeLocal) return { error: "Start time is required." };

  const startTime = new Date(`${startTimeLocal}:00-04:00`);
  if (Number.isNaN(startTime.getTime())) {
    return { error: "That start time couldn't be parsed." };
  }

  return { title, dayNumber, startTime, description, flyerUrl, menu };
}

function revalidateEventPaths(): void {
  revalidatePath("/admin");
  revalidatePath("/schedule");
  revalidatePath("/register/pooja");
  revalidatePath("/register/food");
  revalidatePath("/");
}

// Takes (prevState, formData) rather than just (formData) — unlike most
// other admin actions on this page, this one is wired through
// useActionState (see components/AddEventForm.tsx) so a bad day number, an
// unparseable date, or an insert failure all surface as a visible message
// instead of silently doing nothing.
export async function createEventAction(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { status: "error", message: parsed.error };

  const { error } = await supabaseAdmin.from("events").insert({
    title: parsed.title,
    day_number: parsed.dayNumber,
    start_time: parsed.startTime.toISOString(),
    description: parsed.description,
    flyer_url: parsed.flyerUrl,
    menu: parsed.menu,
  });

  if (error) {
    console.warn("[createEventAction]", error.message);
    return { status: "error", message: `Couldn't save the event: ${error.message}` };
  }

  revalidateEventPaths();
  return { status: "success" };
}

// Same (prevState, formData) + useActionState wiring as createEventAction
// (see components/EditEventForm.tsx), plus the event id bound in ahead of
// time via .bind(null, id) — each event's edit form binds its own id, so
// each gets an independent useActionState instance despite sharing this
// one action.
export async function updateEventAction(
  id: string,
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { status: "error", message: parsed.error };

  // Fetched before the update so the push condition below can tell "a
  // flyer just appeared" (no flyer -> a flyer) apart from an ordinary edit
  // to an event that already had one.
  const { data: existing } = await supabaseAdmin
    .from("events")
    .select("flyer_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("events")
    .update({
      title: parsed.title,
      day_number: parsed.dayNumber,
      start_time: parsed.startTime.toISOString(),
      description: parsed.description,
      flyer_url: parsed.flyerUrl,
      menu: parsed.menu,
    })
    .eq("id", id);

  if (error) {
    console.warn("[updateEventAction]", error.message);
    return { status: "error", message: `Couldn't save the event: ${error.message}` };
  }

  revalidateEventPaths();

  // Broadcasts a push notification the moment a flyer newly appears on an
  // event — same "meaningful, deliberate moment" bar as the Announcement
  // and registration-confirmed pushes above, not every routine edit.
  // Removing or swapping an already-set flyer stays silent, same reasoning
  // as setRegistrationStatusAction only pushing on confirm, not every
  // status change.
  if (!existing?.flyer_url && parsed.flyerUrl) {
    await sendPushToAllSubscribers(
      "New flyer added! 📌",
      `${parsed.title} now has a flyer — check it out on the schedule.`,
      "/schedule"
    );
  }

  return { status: "success" };
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("events").delete().eq("id", id);
  revalidateEventPaths();
}

// Every sign-up lands as 'pending' (see register_for_event() in
// supabase/migrations/20260913020000_adult_child_optional_phone_food_size.sql)
// — nothing auto-confirms a spot. This is how admin actually moves someone
// to confirmed or waitlisted (or back to pending) after reviewing. A
// direct update, not the register_for_event() RPC — that RPC is the public
// sign-up path and always inserts as pending, which isn't what a manual
// decision should do.
//
// Broadcasts a push notification on confirm only — same
// sendPushToAllSubscribers() used for new announcements, so it goes to
// every subscriber, not just the registrant (push_subscriptions has no
// link to who registered; see its migration). The registrant's name is
// included since a confirmed name is already public (registered_details()).
// Waitlisting and reverting someone to 'pending' both stay silent —
// neither is the news a confirmation is.
export async function setRegistrationStatusAction(
  id: string,
  status: "pending" | "confirmed" | "waitlisted"
): Promise<void> {
  await requireAdmin();

  const { data: updated } = await supabaseAdmin
    .from("registrations")
    .update({ status })
    .eq("id", id)
    .select("name, events(day_number)")
    .maybeSingle();

  revalidatePath("/admin");
  revalidatePath("/register/pooja");
  revalidatePath("/register/food");
  revalidatePath("/schedule");

  if (status !== "confirmed") return;

  const dayNumber = (updated?.events as unknown as { day_number: number } | null)?.day_number;
  if (dayNumber == null) return;

  await sendPushToAllSubscribers(
    "Pooja Registration Confirmed",
    `${updated?.name ?? "A registration"}'s spot for Day ${dayNumber} is confirmed!`,
    "/register/pooja"
  );
}

export async function deleteRegistrationAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("registrations").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/register/pooja");
  revalidatePath("/register/food");
  revalidatePath("/schedule");
}

export async function deleteFoodRegistrationAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("food_registrations").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/register/food");
  revalidatePath("/schedule");
}

export async function deleteSuggestionAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("suggestions").delete().eq("id", id);
  revalidatePath("/admin");
}

// -- Charity: year stories -----------------------------------------------

export async function saveCharityYearStoryAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const year = Number(formData.get("year"));
  const story = String(formData.get("story") ?? "").trim();
  if (!Number.isInteger(year) || !story) return;

  // Upsert by year — charity_years has no separate id, `year` is its
  // primary key, so this both adds a new year's story and edits an
  // existing one through the same form.
  await supabaseAdmin
    .from("charity_years")
    .upsert({ year, story, updated_at: new Date().toISOString() });

  revalidatePath("/admin");
  revalidatePath("/charity");
}

export async function deleteCharityYearAction(year: number): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("charity_years").delete().eq("year", year);
  revalidatePath("/admin");
  revalidatePath("/charity");
}

// -- Charity: individual stories --------------------------------------------
//
// Separate from the year write-up above — a year can hold several distinct,
// titled stories (e.g. one family helped, one shelter repaired) rather than
// one blurb covering everything. No upsert-by-key here: each submission is
// its own new row, edited by deleting and re-adding.

export async function addCharityStoryAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const year = Number(formData.get("year"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!Number.isInteger(year) || !title || !body) return;

  await supabaseAdmin.from("charity_stories").insert({ year, title, body });

  revalidatePath("/admin");
  revalidatePath("/charity");
}

export async function deleteCharityStoryAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("charity_stories").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/charity");
}

// -- Charity: media --------------------------------------------------------
//
// Uploads never pass through a Server Action's own request body — that's
// capped at 1MB by default (Next) and ~4.5MB on Vercel's free tier
// regardless (a platform limit, not a Next setting), well under real photo
// or video sizes. Instead: this action hands the browser a one-time signed
// *upload* URL, the browser PUTs the file straight to Supabase Storage
// (components/AddCharityMediaForm.tsx), and confirmCharityMediaAction
// below is called afterward with just the resulting path — small metadata
// only, never the file bytes.

const CHARITY_BUCKET = "charity";
const CHARITY_MEDIA_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "heic", "heif",
  "mp4", "mov", "webm", "m4v",
]);

// Never trust the browser-supplied filename as a storage path directly —
// this generates a fresh random one and keeps only a safe, allowlisted
// extension from the original, so nothing about the original name (path
// separators, odd characters, length) reaches Supabase Storage.
function safeExtension(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  const ext = match?.[1]?.toLowerCase();
  return ext && CHARITY_MEDIA_EXTENSIONS.has(ext) ? ext : "bin";
}

export async function createCharityUploadUrlAction(
  filename: string,
  mediaType: "image" | "video"
): Promise<{ path: string; token: string } | { error: string }> {
  await requireAdmin();

  if (mediaType !== "image" && mediaType !== "video") {
    return { error: "Unsupported file type." };
  }

  const path = `${mediaType}/${randomUUID()}.${safeExtension(filename)}`;
  const { data, error } = await supabaseAdmin.storage
    .from(CHARITY_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.warn("[createCharityUploadUrlAction]", error?.message);
    return { error: "Couldn't prepare the upload — please try again." };
  }

  return { path: data.path, token: data.token };
}

export async function confirmCharityMediaAction(
  path: string,
  mediaType: "image" | "video",
  year: number,
  caption: string
): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();

  if (!Number.isInteger(year)) {
    return { error: "Pick a year first." };
  }

  // Confirms the object actually landed in storage before creating a row
  // that would otherwise point at nothing — createSignedUrl errors for a
  // path nothing was ever uploaded to.
  const { error: signError } = await supabaseAdmin.storage
    .from(CHARITY_BUCKET)
    .createSignedUrl(path, 60);
  if (signError) {
    return { error: "That upload didn't complete — please try again." };
  }

  const { error } = await supabaseAdmin.from("charity_media").insert({
    storage_path: path,
    media_type: mediaType,
    year,
    caption: caption.trim() || null,
  });

  if (error) {
    console.warn("[confirmCharityMediaAction]", error.message);
    return { error: "Couldn't save that — please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/charity");
  return { ok: true };
}

export async function deleteCharityMediaAction(id: string, storagePath: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.storage.from(CHARITY_BUCKET).remove([storagePath]);
  await supabaseAdmin.from("charity_media").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/charity");
}

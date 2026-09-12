"use server";

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
): { title: string; dayNumber: number; startTime: Date; description: string } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const dayNumber = Number(formData.get("day_number"));
  const startTimeLocal = String(formData.get("start_time") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (!Number.isInteger(dayNumber) || dayNumber < 1) {
    return { error: "Day # must be a whole number of 1 or more." };
  }
  if (!startTimeLocal) return { error: "Start time is required." };

  const startTime = new Date(`${startTimeLocal}:00-04:00`);
  if (Number.isNaN(startTime.getTime())) {
    return { error: "That start time couldn't be parsed." };
  }

  return { title, dayNumber, startTime, description };
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

  const { error } = await supabaseAdmin
    .from("events")
    .update({
      title: parsed.title,
      day_number: parsed.dayNumber,
      start_time: parsed.startTime.toISOString(),
      description: parsed.description,
    })
    .eq("id", id);

  if (error) {
    console.warn("[updateEventAction]", error.message);
    return { status: "error", message: `Couldn't save the event: ${error.message}` };
  }

  revalidateEventPaths();
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
export async function setRegistrationStatusAction(
  id: string,
  status: "pending" | "confirmed" | "waitlisted"
): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("registrations").update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/register/pooja");
}

export async function deleteRegistrationAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("registrations").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/register/pooja");
}

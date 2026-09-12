"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

  await supabaseAdmin.from("announcements").insert({ title, body });
  revalidatePath("/admin");
  revalidatePath("/announcements");
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

// The <input type="datetime-local"> this backs gives a plain
// "YYYY-MM-DDTHH:mm" with no timezone — same simplification FESTIVAL_START/
// END already make in lib/config.ts: treat it as America/New_York and
// hardcode the EDT offset. Wrong for events entered after the fall-back to
// EST, same known limitation noted there.
export async function createEventAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const dayNumber = Number(formData.get("day_number"));
  const startTimeLocal = String(formData.get("start_time") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !Number.isInteger(dayNumber) || dayNumber < 1 || !startTimeLocal) return;

  const startTime = new Date(`${startTimeLocal}:00-04:00`);
  if (Number.isNaN(startTime.getTime())) return;

  await supabaseAdmin.from("events").insert({
    title,
    day_number: dayNumber,
    start_time: startTime.toISOString(),
    description,
  });
  revalidatePath("/admin");
  revalidatePath("/schedule");
  revalidatePath("/register/pooja");
  revalidatePath("/register/food");
  revalidatePath("/");
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireAdmin();
  await supabaseAdmin.from("events").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/schedule");
  revalidatePath("/register/pooja");
  revalidatePath("/register/food");
  revalidatePath("/");
}

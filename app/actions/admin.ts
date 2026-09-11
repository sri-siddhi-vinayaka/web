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

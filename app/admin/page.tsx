import type { Metadata } from "next";
import { isAdminRequest } from "@/lib/adminAuth";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAnnouncements, getGalleryItems } from "@/lib/events";
import {
  addGalleryItemAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
  deleteGalleryItemAction,
  loginAction,
  logoutAction,
} from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function getRegistrations() {
  if (!isSupabaseAdminConfigured) return [];

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select("id, name, phone, gotra, created_at, events(title)")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[admin] getRegistrations:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function AdminPage(props: PageProps<"/admin">) {
  const searchParams = await props.searchParams;
  const isAdmin = await isAdminRequest();

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 py-16 sm:px-6">
        <h1 className="text-xl font-bold text-brand">Admin</h1>
        <form action={loginAction} className="mt-6 flex flex-col gap-3">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
          {searchParams?.error && (
            <p className="text-sm font-medium text-danger">Incorrect password.</p>
          )}
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-primary px-4 py-2 font-medium text-primary-contrast hover:opacity-90"
          >
            Log in
          </button>
        </form>
      </div>
    );
  }

  const [registrations, announcements, galleryItems] = await Promise.all([
    getRegistrations(),
    getAnnouncements(),
    getGalleryItems(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Admin</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm font-medium text-muted underline underline-offset-2"
          >
            Log out
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Registrations ({registrations.length})
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl bg-surface shadow-sm ring-1 ring-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Gotra</th>
                <th className="px-3 py-2 font-medium">Event</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-foreground">{registration.name}</td>
                  <td className="px-3 py-2 text-foreground">{registration.phone}</td>
                  <td className="px-3 py-2 text-muted">{registration.gotra ?? "—"}</td>
                  <td className="px-3 py-2 text-muted">
                    {(registration.events as { title: string }[] | null)?.[0]?.title ?? "—"}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-muted">
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Announcements</h2>
        <form
          action={createAnnouncementAction}
          className="mt-3 flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
        >
          <input
            name="title"
            placeholder="Title"
            required
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
          <textarea
            name="body"
            placeholder="Body"
            required
            rows={3}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
          <button
            type="submit"
            className="min-h-11 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast hover:opacity-90"
          >
            Post announcement
          </button>
        </form>
        <ul className="mt-3 flex flex-col gap-2">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-surface p-3 text-sm ring-1 ring-border"
            >
              <div>
                <p className="font-medium text-foreground">{announcement.title}</p>
                <p className="text-muted">{announcement.body}</p>
              </div>
              <form action={deleteAnnouncementAction.bind(null, announcement.id)}>
                <button type="submit" className="shrink-0 text-danger underline underline-offset-2">
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Gallery</h2>
        <form
          action={addGalleryItemAction}
          className="mt-3 flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
        >
          <input
            name="image_url"
            placeholder="Image URL"
            required
            type="url"
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
          <input
            name="caption"
            placeholder="Caption (optional)"
            className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          />
          <button
            type="submit"
            className="min-h-11 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast hover:opacity-90"
          >
            Add photo
          </button>
        </form>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {galleryItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-1 rounded-xl bg-surface p-2 text-xs ring-1 ring-border"
            >
              <span className="truncate text-muted">{item.caption ?? item.image_url}</span>
              <form action={deleteGalleryItemAction.bind(null, item.id)}>
                <button type="submit" className="text-danger underline underline-offset-2">
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

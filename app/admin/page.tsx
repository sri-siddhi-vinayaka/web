import type { Metadata } from "next";
import { isAdminRequest } from "@/lib/adminAuth";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAnnouncements, getEvents, getGalleryItems } from "@/lib/events";
import AddEventForm from "@/components/AddEventForm";
import EditEventForm from "@/components/EditEventForm";
import {
  addGalleryItemAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
  deleteEventAction,
  deleteGalleryItemAction,
  deleteRegistrationAction,
  loginAction,
  logoutAction,
  setRegistrationStatusAction,
} from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const FOOD_SIZE_LABELS: Record<string, string> = {
  quarter_pack: "Quarter pack",
  half_tray: "Half tray",
  full_tray: "Full tray",
  family_pack: "Family pack",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
}

async function getRegistrations() {
  if (!isSupabaseAdminConfigured) return [];

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select("id, name, phone, adult_count, child_count, status, created_at, events(title, start_time)")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[admin] getRegistrations:", error.message);
    return [];
  }
  return data ?? [];
}

async function getFoodRegistrations() {
  if (!isSupabaseAdminConfigured) return [];

  const { data, error } = await supabaseAdmin
    .from("food_registrations")
    .select("id, contact_name, phone, dish_name, quantity_size, created_at, events(title, start_time)")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[admin] getFoodRegistrations:", error.message);
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

  const [events, registrations, foodRegistrations, announcements, galleryItems] = await Promise.all([
    getEvents(),
    getRegistrations(),
    getFoodRegistrations(),
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
          Events / Days ({events.length})
        </h2>
        <p className="mt-1 text-sm text-muted">
          A day needs an event here before it shows up on the schedule or
          either registration page.
        </p>
        <AddEventForm />
        <ul className="mt-3 flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-surface p-3 text-sm ring-1 ring-border"
            >
              <EditEventForm event={event} />
              <form action={deleteEventAction.bind(null, event.id)}>
                <button type="submit" className="shrink-0 text-danger underline underline-offset-2">
                  Delete
                </button>
              </form>
            </li>
          ))}
          {events.length === 0 && (
            <li className="rounded-xl bg-surface p-3 text-center text-sm text-muted ring-1 ring-border">
              No events yet.
            </li>
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Registrations ({registrations.length})
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl bg-surface shadow-sm ring-1 ring-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-2 font-medium">Name(s)</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Adults</th>
                <th className="px-3 py-2 font-medium">Children</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => {
                const event = (registration.events as { title: string; start_time: string }[] | null)?.[0];
                const isWaitlisted = registration.status === "waitlisted";
                return (
                  <tr key={registration.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{registration.name}</td>
                    <td className="px-3 py-2 text-foreground">{registration.phone ?? "—"}</td>
                    <td className="px-3 py-2 text-muted">{registration.adult_count}</td>
                    <td className="px-3 py-2 text-muted">{registration.child_count}</td>
                    <td className="px-3 py-2 text-muted">{event ? formatDate(event.start_time) : "—"}</td>
                    <td className="px-3 py-2 text-muted">{event?.title ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          isWaitlisted
                            ? "rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-border"
                            : "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20"
                        }
                      >
                        {isWaitlisted ? "Waitlisted" : "Confirmed"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <form
                          action={setRegistrationStatusAction.bind(
                            null,
                            registration.id,
                            isWaitlisted ? "confirmed" : "waitlisted"
                          )}
                        >
                          <button type="submit" className="text-primary underline underline-offset-2">
                            {isWaitlisted ? "Confirm" : "Waitlist"}
                          </button>
                        </form>
                        <form action={deleteRegistrationAction.bind(null, registration.id)}>
                          <button type="submit" className="text-danger underline underline-offset-2">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-muted">
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Food Registrations ({foodRegistrations.length})
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl bg-surface shadow-sm ring-1 ring-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-2 font-medium">Contact</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Dish</th>
                <th className="px-3 py-2 font-medium">Size</th>
              </tr>
            </thead>
            <tbody>
              {foodRegistrations.map((registration) => {
                const event = (registration.events as { title: string; start_time: string }[] | null)?.[0];
                return (
                  <tr key={registration.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{registration.contact_name}</td>
                    <td className="px-3 py-2 text-foreground">{registration.phone ?? "—"}</td>
                    <td className="px-3 py-2 text-muted">{event ? formatDate(event.start_time) : "—"}</td>
                    <td className="px-3 py-2 text-muted">{registration.dish_name}</td>
                    <td className="px-3 py-2 text-muted">{FOOD_SIZE_LABELS[registration.quantity_size] ?? registration.quantity_size}</td>
                  </tr>
                );
              })}
              {foodRegistrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-muted">
                    No food registrations yet.
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

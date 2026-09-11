import type { Metadata } from "next";
import { getAnnouncements } from "@/lib/events";

export const metadata: Metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Announcements</h1>

      {announcements.length === 0 ? (
        <p className="mt-3 text-muted">
          Committee updates will be posted here as the festival approaches.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
            >
              <p className="font-semibold text-foreground">{announcement.title}</p>
              <p className="mt-1 text-sm text-muted">{announcement.body}</p>
              <p className="mt-2 text-xs text-muted">
                {new Date(announcement.created_at).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

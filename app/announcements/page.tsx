import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import AcknowledgeAnnouncement from "@/components/AcknowledgeAnnouncement";
import { getAnnouncements } from "@/lib/events";

export const metadata: Metadata = { title: "Announcements" };

// acknowledge_announcement() (see
// supabase/migrations/20260916205900_announcement_acknowledgements.sql) is a
// public write with no admin action to hang a revalidation off — same
// reasoning as / and /schedule's own force-dynamic exports — so static
// prerendering would freeze every announcement's ack_count to whatever it
// was at the last deploy or admin-triggered revalidation.
export const dynamic = "force-dynamic";

// An in-app relative path written inline in an announcement's body (e.g.
// "/schedule#day-5") renders as a real, tappable link instead of literal
// text — lets whoever writes an announcement point straight at a specific
// schedule day without this table needing markdown support. Trailing
// punctuation (a period ending the sentence, a closing paren) is peeled off
// first so it doesn't get swallowed into the link target.
function linkifyPaths(text: string): ReactNode {
  return text.split(/(\s+)/).map((chunk, index) => {
    const match = chunk.match(/^(\/[\w\-/#]+)([.,!?)\]]*)$/);
    if (!match) return chunk;

    const [, path, trailingPunctuation] = match;
    return (
      <span key={index}>
        <Link href={path} className="font-medium text-primary underline underline-offset-2">
          {path}
        </Link>
        {trailingPunctuation}
      </span>
    );
  });
}

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
              <p className="mt-1 whitespace-pre-line text-sm text-muted">
                {linkifyPaths(announcement.body)}
              </p>
              <p className="mt-2 text-xs text-muted">
                {new Date(announcement.created_at).toLocaleDateString("en-US", {
                  timeZone: "America/New_York",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <AcknowledgeAnnouncement
                announcementId={announcement.id}
                initialCount={announcement.ack_count}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

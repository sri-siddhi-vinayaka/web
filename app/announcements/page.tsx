import type { Metadata } from "next";

export const metadata: Metadata = { title: "Announcements" };

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Announcements</h1>
      <p className="mt-3 text-muted">
        Committee updates will be posted here as the festival approaches.
      </p>
    </div>
  );
}

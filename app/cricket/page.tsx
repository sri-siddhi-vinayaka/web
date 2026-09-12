import type { Metadata } from "next";
import { CRICKET_TOURNAMENTS } from "@/lib/config";

export const metadata: Metadata = { title: "Cricket" };

export default function CricketPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Cricket</h1>
      <p className="mt-1 text-sm text-muted">
        Memories from the Sri Siddhi Vinayaka cricket tournaments, year by year.
      </p>

      <div className="mt-6 flex flex-col gap-8">
        {CRICKET_TOURNAMENTS.map((tournament) => (
          <section key={tournament.year}>
            <h2 className="text-lg font-semibold text-foreground">{tournament.year} Tournament</h2>
            <a
              href={tournament.leagueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-primary underline underline-offset-2"
            >
              View league standings &amp; stats
            </a>

            <ul className="mt-3 flex flex-col gap-2">
              {tournament.videos.map((video) => (
                <li key={video.url}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center rounded-xl bg-surface p-3 text-sm font-medium text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-surface-muted"
                  >
                    {video.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

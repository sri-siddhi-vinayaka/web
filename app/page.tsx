import CountdownTimer from "@/components/CountdownTimer";
import { FESTIVAL_START, SITE_NAME } from "@/lib/config";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Ganesh Chaturthi
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
          {SITE_NAME}
        </h1>
        <p className="max-w-md text-base text-muted">
          Join us for ten days of pooja, celebration, and community — schedule,
          registration, and live darshan, all in one place.
        </p>
        <CountdownTimer target={FESTIVAL_START.toISOString()} />
      </section>

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">
          Today&apos;s highlights
        </h2>
        <p className="mt-2 text-sm text-muted">
          The full day-by-day schedule is being finalized — check back here or
          the{" "}
          <a href="/schedule" className="font-medium text-primary underline underline-offset-2">
            schedule page
          </a>{" "}
          soon.
        </p>
      </section>
    </div>
  );
}

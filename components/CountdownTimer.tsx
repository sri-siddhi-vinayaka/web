"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Phase = "before" | "during" | "after";

type TimerState = {
  phase: Phase;
  remaining: Remaining;
};

function getRemaining(target: Date, now: number): Remaining {
  const diff = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function getPhase(start: Date, end: Date, now: number): Phase {
  if (now < start.getTime()) return "before";
  if (now < end.getTime()) return "during";
  return "after";
}

function formatEndDate(end: Date): string {
  // "through" is inclusive of the last day, so display the day before this
  // exclusive upper bound.
  const lastDay = new Date(end.getTime() - 1);
  return lastDay.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
  });
}

export default function CountdownTimer({ start, end }: { start: string; end: string }) {
  // Stays null until the first client-side tick, same reasoning as before:
  // Date.now() must never run during the render that also runs on the
  // server, or the server and client's first paint disagree and React
  // throws a hydration mismatch.
  const [state, setState] = useState<TimerState | null>(null);

  useEffect(() => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const tick = () => {
      const now = Date.now();
      setState({ phase: getPhase(startDate, endDate, now), remaining: getRemaining(startDate, now) });
    };
    const kickoff = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [start, end]);

  if (state?.phase === "during") {
    return (
      <p className="text-lg font-semibold text-primary" role="status">
        The celebration is here! Join us through {formatEndDate(new Date(end))}.
      </p>
    );
  }

  if (state?.phase === "after") {
    return (
      <p className="text-lg font-semibold text-primary" role="status">
        Thank you for celebrating with us this year — see you again next
        Ganesh Chaturthi!
      </p>
    );
  }

  const units = [
    { value: state?.remaining.days, label: "days" },
    { value: state?.remaining.hours, label: "hrs" },
    { value: state?.remaining.minutes, label: "min" },
    { value: state?.remaining.seconds, label: "sec" },
  ];

  return (
    <div className="flex gap-3 sm:gap-4" role="timer" aria-live="off">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex min-w-[4.25rem] flex-col items-center rounded-xl bg-surface px-3 py-2 shadow-sm ring-1 ring-border"
        >
          <span className="text-2xl font-bold tabular-nums text-brand sm:text-3xl">
            {unit.value ?? "--"}
          </span>
          <span className="text-xs uppercase tracking-wide text-muted">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

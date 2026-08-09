"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function getRemaining(target: Date): Remaining {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff === 0,
  };
}

export default function CountdownTimer({ target }: { target: string }) {
  // Stays null until the first client-side tick. Date.now() must never run
  // during the render that produces the numbers shown — the server renders
  // at request time and the client's first render happens moments later, so
  // seeding state from Date.now() up front makes the two disagree and React
  // throws a hydration mismatch.
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const targetDate = new Date(target);
    const tick = () => setRemaining(getRemaining(targetDate));
    const kickoff = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [target]);

  if (remaining?.done) {
    return (
      <p className="text-lg font-semibold text-primary">
        The celebration has begun!
      </p>
    );
  }

  const units = [
    { value: remaining?.days, label: "days" },
    { value: remaining?.hours, label: "hrs" },
    { value: remaining?.minutes, label: "min" },
    { value: remaining?.seconds, label: "sec" },
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

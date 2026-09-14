import type { ReactNode } from "react";

// Shared styling for a privacy disclosure; wording differs per flow (see
// app/register/pooja/page.tsx and app/register/food/page.tsx) since what's
// actually public differs — Pooja registration shows the name publicly,
// Food registration doesn't.
export default function PrivacyNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-surface-muted p-4 text-sm text-muted ring-1 ring-border">
      {children}
    </p>
  );
}

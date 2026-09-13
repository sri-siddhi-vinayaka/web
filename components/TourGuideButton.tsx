"use client";

import type { ReactNode } from "react";
import { useTourGuide } from "@/components/TourGuideProvider";

export default function TourGuideButton({
  className,
  onBeforeOpen,
  children,
  "aria-label": ariaLabel,
}: {
  className?: string;
  onBeforeOpen?: () => void;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const openTour = useTourGuide();

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.();
        openTour();
      }}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}

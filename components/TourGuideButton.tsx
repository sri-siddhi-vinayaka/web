"use client";

import { useTourGuide } from "@/components/TourGuideProvider";

export default function TourGuideButton({
  className,
  onBeforeOpen,
}: {
  className?: string;
  onBeforeOpen?: () => void;
}) {
  const openTour = useTourGuide();

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.();
        openTour();
      }}
      className={className}
    >
      Quick Tour Guide
    </button>
  );
}

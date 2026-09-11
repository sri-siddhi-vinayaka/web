"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SRC = "/ganesh-2025.jpeg";
const ALT = "Lord Ganesha";

export default function GaneshaPhoto() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View larger photo of Lord Ganesha"
        className="relative h-48 w-48 overflow-hidden rounded-full shadow-sm ring-1 ring-border transition-opacity hover:opacity-90 sm:h-56 sm:w-56"
      >
        <Image
          src={SRC}
          alt={ALT}
          fill
          sizes="(min-width: 640px) 224px, 192px"
          className="object-cover"
          priority
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ALT}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-lg text-foreground shadow-sm"
          >
            ✕
          </button>
          <Image
            src={SRC}
            alt={ALT}
            width={1600}
            height={1200}
            onClick={(event) => event.stopPropagation()}
            className="h-auto max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
}

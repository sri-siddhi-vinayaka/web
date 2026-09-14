"use client";

import { useRef, useState } from "react";
import {
  confirmCharityMediaAction,
  createCharityUploadUrlAction,
} from "@/app/actions/admin";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "uploading" | "error";

// Not wired through useActionState like the other admin forms — a single
// action call can't express "get an upload URL, then PUT the file to
// Storage, then confirm the row," so this drives that sequence by hand.
// The confirm step's revalidatePath() still refreshes the admin list the
// same way every other action here does; Next applies it automatically
// even for an action called directly like this, not just one bound to a
// <form action>.
export default function AddCharityMediaForm({ defaultYear }: { defaultYear: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const files = Array.from(fileInputRef.current?.files ?? []);
    const year = Number(yearInputRef.current?.value);
    if (files.length === 0 || !Number.isInteger(year)) return;

    // Same caption (if any) applies to every file in this batch — a set of
    // event photos usually shares one, and a per-file caption field for a
    // multi-file picker would be a lot of extra UI for a rare need; nothing
    // stops uploading a second batch with a different caption for the rest.
    const caption = captionInputRef.current?.value ?? "";

    setStatus("uploading");
    setError(null);
    setProgress({ done: 0, total: files.length });

    // Sequential, not parallel — each step re-checks admin auth and hits
    // Supabase on its own; racing several at once wouldn't meaningfully
    // speed up a handful of files and would make "done: N of M" meaningless.
    // One bad file doesn't stop the rest of the batch — failures are
    // collected and reported together at the end instead.
    const failed: string[] = [];
    for (const file of files) {
      const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";

      const prepared = await createCharityUploadUrlAction(file.name, mediaType);
      if ("error" in prepared) {
        failed.push(file.name);
        setProgress((current) => (current ? { ...current, done: current.done + 1 } : current));
        continue;
      }

      const { error: uploadError } = await supabase.storage
        .from("charity")
        .uploadToSignedUrl(prepared.path, prepared.token, file);
      if (uploadError) {
        failed.push(file.name);
        setProgress((current) => (current ? { ...current, done: current.done + 1 } : current));
        continue;
      }

      const confirmed = await confirmCharityMediaAction(prepared.path, mediaType, year, caption);
      if ("error" in confirmed) failed.push(file.name);
      setProgress((current) => (current ? { ...current, done: current.done + 1 } : current));
    }

    setProgress(null);
    if (failed.length > 0) {
      setStatus("error");
      setError(
        failed.length === files.length
          ? "Upload failed — please try again."
          : `${failed.length} of ${files.length} didn't upload: ${failed.join(", ")}`
      );
      return;
    }

    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (captionInputRef.current) captionInputRef.current.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
    >
      <input
        ref={fileInputRef}
        name="file"
        type="file"
        accept="image/*,video/*"
        multiple
        required
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      <input
        ref={yearInputRef}
        name="year"
        type="number"
        placeholder="Year"
        required
        defaultValue={defaultYear}
        className="min-h-11 w-28 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      <input
        ref={captionInputRef}
        name="caption"
        placeholder="Caption (optional — applies to every file selected above)"
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <button
        type="submit"
        disabled={status === "uploading"}
        className="min-h-11 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast hover:opacity-90 disabled:opacity-60"
      >
        {status === "uploading" && progress
          ? `Uploading ${progress.done} of ${progress.total}…`
          : "Upload photos or videos"}
      </button>
    </form>
  );
}

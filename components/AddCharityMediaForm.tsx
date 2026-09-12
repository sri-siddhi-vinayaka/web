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
export default function AddCharityMediaForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
    const caption = captionInputRef.current?.value ?? "";

    setStatus("uploading");
    setError(null);

    const prepared = await createCharityUploadUrlAction(file.name, mediaType);
    if ("error" in prepared) {
      setStatus("error");
      setError(prepared.error);
      return;
    }

    const { error: uploadError } = await supabase.storage
      .from("charity")
      .uploadToSignedUrl(prepared.path, prepared.token, file);
    if (uploadError) {
      setStatus("error");
      setError("Upload failed — please try again.");
      return;
    }

    const confirmed = await confirmCharityMediaAction(prepared.path, mediaType, caption);
    if ("error" in confirmed) {
      setStatus("error");
      setError(confirmed.error);
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
        required
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      <input
        ref={captionInputRef}
        name="caption"
        placeholder="Caption (optional)"
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <button
        type="submit"
        disabled={status === "uploading"}
        className="min-h-11 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast hover:opacity-90 disabled:opacity-60"
      >
        {status === "uploading" ? "Uploading…" : "Upload photo or video"}
      </button>
    </form>
  );
}

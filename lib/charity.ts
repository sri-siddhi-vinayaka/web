import "server-only";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";

// The bucket is private (see the migration) — every read goes through a
// signed URL minted here with the service role key, never a public bucket
// URL. Used from the public /charity page as well as /admin, not just
// admin routes: reading this table never exposes anything the visitor
// isn't already about to be shown, and it's the only way to turn a stored
// object into something a plain <img>/<video> tag can point at.
const CHARITY_BUCKET = "charity";

// Long enough that a page load and its signed URLs stay valid for one
// viewing session; short enough that a copied/shared link goes stale
// afterward rather than becoming a permanent public link in disguise.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type CharityMediaItem = {
  id: string;
  url: string;
  media_type: "image" | "video";
  caption: string | null;
  // Only used by /admin (to bind the delete action to the right storage
  // object) — the public /charity page renders `url` and ignores this.
  // Not sensitive on its own (a random UUID, not a guessable name), so no
  // harm in it being part of the same shared fetch.
  storage_path: string;
};

function logAndFallback<T>(context: string, error: { message: string }, fallback: T): T {
  console.warn(`[lib/charity] ${context}:`, error.message);
  return fallback;
}

export async function getCharityMedia(): Promise<CharityMediaItem[]> {
  if (!isSupabaseAdminConfigured) return [];

  const { data, error } = await supabaseAdmin
    .from("charity_media")
    .select("id, storage_path, media_type, caption")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return logAndFallback("getCharityMedia", error ?? { message: "no data" }, []);
  }

  const items = await Promise.all(
    data.map(async (row): Promise<CharityMediaItem | null> => {
      const { data: signed, error: signError } = await supabaseAdmin.storage
        .from(CHARITY_BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);

      if (signError || !signed) {
        console.warn(`[lib/charity] signing ${row.storage_path}:`, signError?.message);
        return null;
      }

      return {
        id: row.id,
        url: signed.signedUrl,
        media_type: row.media_type as "image" | "video",
        caption: row.caption,
        storage_path: row.storage_path,
      };
    })
  );

  return items.filter((item): item is CharityMediaItem => item !== null);
}

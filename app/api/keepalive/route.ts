import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Hit by a scheduled GitHub Actions workflow every few days so the Supabase
// free-tier project doesn't auto-pause from inactivity. A cheap select
// against a public table is enough — no auth needed since RLS already
// allows public reads on `events`.
export async function GET() {
  const { error } = await supabase.from("events").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

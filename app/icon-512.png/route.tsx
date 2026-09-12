import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/lib/appIcon";

// See app/icon-192.png/route.tsx — same reasoning, the other manifest size.
export async function GET() {
  return new ImageResponse(<AppIconGlyph size={512} />, { width: 512, height: 512 });
}

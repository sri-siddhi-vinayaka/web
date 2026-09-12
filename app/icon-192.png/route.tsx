import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/lib/appIcon";

// A plain Route Handler at a stable, hand-picked path — not the special
// `icon`/`apple-icon` file convention, whose generated URLs aren't ones you
// can predict and hardcode into app/manifest.ts's icons array. The PWA
// manifest needs known URLs at specific sizes (192/512 are the two sizes
// browsers actually check for install-eligibility).
export async function GET() {
  return new ImageResponse(<AppIconGlyph size={192} />, { width: 192, height: 192 });
}

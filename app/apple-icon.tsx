import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/lib/appIcon";

// Used specifically for iOS "Add to Home Screen" — Safari ignores the PWA
// manifest's icons for this and looks for this convention instead.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<AppIconGlyph size={180} />, size);
}

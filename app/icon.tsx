import { ImageResponse } from "next/og";
import { AppIconGlyph } from "@/lib/appIcon";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<AppIconGlyph size={48} />, size);
}

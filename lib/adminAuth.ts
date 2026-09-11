import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  const message = "Missing ADMIN_PASSWORD env var — required to gate /admin.";

  // Fail loud in production (a deployed admin page nobody can ever log into
  // is a misconfiguration worth crashing on); in local dev, warn and let the
  // page render — login simply always rejects until it's set, rather than
  // 500ing the whole route at import time.
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[lib/adminAuth] ${message}`);
}

export const ADMIN_COOKIE_NAME = "admin_session";

// A single shared password is "a speed bump, not authentication" (AGENTS.md)
// — this cookie is a deterministic HMAC of ADMIN_PASSWORD rather than a
// random session token, so no session store is needed. Never put anything
// behind this gate that would be damaging to leak.
function adminCookieValue(): string {
  return createHmac("sha256", ADMIN_PASSWORD ?? "unset").update("admin").digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  return Boolean(ADMIN_PASSWORD) && password === ADMIN_PASSWORD;
}

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;

  const expected = Buffer.from(adminCookieValue());
  const actual = Buffer.from(value);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

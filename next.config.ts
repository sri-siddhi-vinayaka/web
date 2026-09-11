import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Gallery photos live in Supabase Storage, always served from a
    // "<project-ref>.supabase.co" subdomain. Tighten this to the exact
    // project hostname once a Supabase project actually exists.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;

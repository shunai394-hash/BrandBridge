import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost and 127.0.0.1 are different origins (cookies + HMR + Router Cache).
  // Allow both in dev so chunks/HMR work whichever host the user uses.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  experimental: {
    // product image upload via server action (max 5MB + FormData overhead)
    serverActions: {
      bodySizeLimit: "6mb",
    },
    // Client Router Cache: do not keep stale dynamic /cases payloads per-host
    // (static minimum is 30s in Next 16 — 0 was rejected and ignored).
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default nextConfig;

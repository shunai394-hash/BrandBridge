import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost and 127.0.0.1 are different origins (cookies + HMR + Router Cache).
  // Allow both in dev so chunks/HMR work whichever host the user uses.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async redirects() {
    return [
      {
        source: "/en/japan-market-entry/us-brands-entering-japan",
        destination: "/en/us",
        permanent: true,
      },
      {
        source: "/en/japan-market-entry/uk-brands-entering-japan",
        destination: "/en/uk",
        permanent: true,
      },
      {
        source: "/en/japan-market-entry/german-brands-entering-japan",
        destination: "/en/germany",
        permanent: true,
      },
      {
        source: "/cases/7c990b6e-6dc8-49ea-99b8-11da060a4327",
        destination: "/cases/3774182c-a581-4c03-8f6a-c60b9034820c",
        permanent: true,
      },
      {
        source: "/en/cases/7c990b6e-6dc8-49ea-99b8-11da060a4327",
        destination: "/en/cases/3774182c-a581-4c03-8f6a-c60b9034820c",
        permanent: true,
      },
      {
        source: "/cases/7c990b6e-6dc8-49ea-99d8-11da060a4327",
        destination: "/cases/3774182c-a581-4c03-8f6a-c60b9034820c",
        permanent: true,
      },
      {
        source: "/en/cases/7c990b6e-6dc8-49ea-99d8-11da060a4327",
        destination: "/en/cases/3774182c-a581-4c03-8f6a-c60b9034820c",
        permanent: true,
      },
    ];
  },
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


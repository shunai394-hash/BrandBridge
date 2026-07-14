import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // product image upload via server action (max 5MB + FormData overhead)
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;

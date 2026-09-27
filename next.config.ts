import type { NextConfig } from "next";

// Allow the configured file size plus some room for the other form fields.
const bodyLimit = `${Number(process.env.MAX_FILE_SIZE_MB || 10) + 1}mb` as const;

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions default to a 1 MB body limit.
    serverActions: { bodySizeLimit: bodyLimit },
    // proxy.ts buffers request bodies (10 MB by default); keep it in sync so uploads aren't truncated.
    proxyClientMaxBodySize: bodyLimit,
  },
};

export default nextConfig;

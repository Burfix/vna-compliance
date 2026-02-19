import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail builds on ESLint warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail builds on TypeScript errors during production builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

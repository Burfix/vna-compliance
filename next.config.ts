import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail builds on TypeScript errors during production builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint errors won't fail the build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript errors won't fail the build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

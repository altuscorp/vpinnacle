import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  devIndicators: false,
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;

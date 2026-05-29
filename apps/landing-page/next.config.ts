import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Expand Turbopack's file-system root to the monorepo root so it can
    // reach the shared/ directory (which is outside apps/landing-page/).
    // Required per the Next.js 16 docs for any file:// or symlinked local packages.
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;

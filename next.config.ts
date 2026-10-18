import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.mzstatic.com" }],
  },
  /* config options here */
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query", "@base-ui/react"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

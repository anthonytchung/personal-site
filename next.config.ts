import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingIncludes: {
    "/blog": ["./content/journal/*.mdx"],
    "/blog/*": ["./content/journal/*.mdx"],
    "/travellogs": ["./content/travellogs/*.mdx"],
    "/travellogs/*": ["./content/travellogs/*.mdx"],
  },
  turbopack: {
    rules: {
      // Only the Tailwind entry needs this loader. Matching *.module.css
      // rewrites its extension and loses Next's CSS Module class exports.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

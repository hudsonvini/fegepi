import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the native codec and its shared libraries together in Vercel functions.
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/sharp/**/*',
      './node_modules/@img/sharp-linux-x64/**/*',
      './node_modules/@img/sharp-libvips-linux-x64/**/*',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": [
      "data/**/*",
      "node_modules/@pkl-community/pkl/**/*",
      "node_modules/@pkl-community/pkl-*/*",
      "node_modules/@pkl-community/pkl-*/**/*",
    ],
  },
};

export default nextConfig;

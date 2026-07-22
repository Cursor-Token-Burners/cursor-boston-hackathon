import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep config minimal for hackathon reliability. turbopack.root just
  // silences the multi-lockfile workspace-root warning.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

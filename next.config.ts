import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/",
      destination: "/pages/signin",
      permanent: false,
    },
  ],
};

export default nextConfig;

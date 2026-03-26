import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/",
      destination: "/signin",
      permanent: false,
    },
  ],
};

export default nextConfig;

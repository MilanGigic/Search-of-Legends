import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "ddragon.leagueoflegends.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;

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
      {
        hostname: "raw.communitydragon.org",
        protocol: "https",
      },
      {
        hostname: "static.wikia.nocookie.net",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;

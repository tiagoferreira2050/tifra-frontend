import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "app.tifra.com.br" }],
        destination: "/panel",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

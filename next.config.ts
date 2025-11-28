import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

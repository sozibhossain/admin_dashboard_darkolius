import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTPUBLICBASEURL:
      process.env.NEXTPUBLICBASEURL ?? process.env.NEXT_PUBLIC_BASE_URL ?? "",
  },
};

export default nextConfig;

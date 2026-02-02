import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix lockfile warning
  turbopack: {
    root: __dirname,
  },
  // Image optimization for external images (Supabase storage)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;

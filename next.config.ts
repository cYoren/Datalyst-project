import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize heavy package imports for better tree-shaking
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Use modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
  },
  // Remove console.logs in production for smaller bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

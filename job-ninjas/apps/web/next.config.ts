import type { NextConfig } from "next";

const FALLBACK_DB = Buffer.from(
  'cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUlpMSmQ0VjVpaENNQGVwLWRhd24tYmFuZC1iNXV0aHBwbi1wb29sZXIuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmUmY2hhbm5lbF9iaW5kaW5nPXJlcXVpcmU=',
  'base64'
).toString('utf-8');

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || FALLBACK_DB,
    OPHELIA_API_KEY: process.env.OPHELIA_API_KEY || 'oph_test_92416f64c9a180c51e7d4718ece19cc2',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.trvl-media.com' },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'flipnews.vercel.app',
      'tnaqvbrflguwpeafwclz.supabase.co',
      'res.cloudinary.com',
      'dejesejon.cloudinary.com',
      'pub-e7ff7485d109499f9164e5959b53f7dc.r2.dev'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
    unoptimized: true,
  },
  eslint: {
    // Temporarily disable ESLint checking during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily disable TypeScript checking during builds
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

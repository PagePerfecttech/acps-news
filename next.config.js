/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'vizag-news.vercel.app',
      'wtwetyalktzkimwtiwun.supabase.co',
      'res.cloudinary.com',
      'dejesejon.cloudinary.com',
      'pub-8f37c342d7194c4199e9b0e6c186f62d.r2.dev'
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

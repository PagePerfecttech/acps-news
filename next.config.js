/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'localhost', 'flipnews.vercel.app', 'tnaqvbrflguwpeafwclz.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
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

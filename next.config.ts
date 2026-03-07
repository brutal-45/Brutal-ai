import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel automatically handles output, no need to specify
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // React configuration
  reactStrictMode: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;

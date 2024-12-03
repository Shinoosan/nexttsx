import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add this to disable SSR
  runtime: 'edge',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        http: false,
        https: false,
      };
    }

    config.externals = config.externals || {};
    config.externals['abort-controller'] = 'abort-controller';

    return config;
  },
  experimental: {
    // Remove appDir as it's deprecated in Next.js 14
    serverComponentsExternalPackages: ['next/script']
  }
} as const;

export default nextConfig;
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Configure for client-side rendering
  output: 'export',  // This enables static HTML export
  images: {
    unoptimized: true, // Required for static export
  },
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
    serverComponentsExternalPackages: ['next/script']
  }
} as const;

export default nextConfig;
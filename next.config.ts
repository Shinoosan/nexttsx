import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

    // Add the abort-controller package as an external module
    config.externals = config.externals || {};
    config.externals['abort-controller'] = 'abort-controller';

    return config;
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['next/script'],
  },
};

export default nextConfig;
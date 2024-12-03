/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable SSR
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
  // Remove appDir as it's no longer needed in Next.js 14
  experimental: {
    serverComponentsExternalPackages: ['next/script']
  }
};

module.exports = nextConfig;
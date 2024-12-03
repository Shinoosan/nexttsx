/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable server-side rendering
  experimental: {
    serverComponentsExternalPackages: ['next/script'],
    // Force all pages to be statically generated
    isrMemoryCacheSize: 0,
    // Disable server components
    serverComponents: false
  },
  // Force static rendering
  trailingSlash: true,
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
  }
};

module.exports = nextConfig;
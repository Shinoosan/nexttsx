/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Updated experimental options
    isrMemoryCacheSize: 0,
    serverActions: false,
    appDir: true,
  },
  // Force static rendering
  output: 'export',
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    // Client-side polyfills
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

    // External modules
    config.externals = {
      ...(config.externals || {}),
      'abort-controller': 'abort-controller',
    };

    return config;
  }
};

module.exports = nextConfig;
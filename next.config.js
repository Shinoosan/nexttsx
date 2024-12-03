/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove output: 'export' as it's causing issues with dynamic routes
  // and server-side features
  
  experimental: {
    // Add these optimizations for better build performance
    workerThreads: false,
    cpus: 1,
    isrMemoryCacheSize: 0,
  },

  // Change this for better dynamic route handling
  trailingSlash: false,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...(config.resolve?.fallback || {}),
          net: false,
          tls: false,
          fs: false,
          http: false,
          https: false,
        },
      };
    }

    config.externals = [
      (context, callback) => {
        if (context.request === 'abort-controller') {
          return callback(null, 'abort-controller');
        }
        callback();
      },
      ...(Array.isArray(config.externals) ? config.externals : []),
    ];

    return config;
  },

  // Update images configuration for production
  images: {
    unoptimized: true,
    domains: [], // Add your image domains here if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Add this for proper static/dynamic hybrid rendering
  output: 'standalone',
};

module.exports = nextConfig;
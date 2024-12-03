// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Only keep supported experimental features
    isrMemoryCacheSize: 0,
  },
  // Force static rendering
  output: 'export',
  trailingSlash: true,
  webpack: (config: WebpackConfig, { isServer }): WebpackConfig => {
    // Client-side polyfills
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

    // Correct way to add externals
    config.externals = [
      // Function form of externals to handle dynamic cases
      function({ context, request }, callback) {
        if (request === 'abort-controller') {
          // Externalize abort-controller
          return callback(null, 'abort-controller');
        }
        callback();
      },
      // Add any existing externals
      ...(Array.isArray(config.externals) ? config.externals : []),
    ];

    return config;
  },
  // Add any additional configuration needed for your static site
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server features since we're doing static export
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
};

export default nextConfig;
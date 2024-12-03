/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Only keep supported experimental features
    isrMemoryCacheSize: 0,
  },
  // Force static rendering
  output: 'export',
  trailingSlash: true,
  webpack: (config, { isServer }) => {
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
      function(context, callback) {
        if (context.request === 'abort-controller') {
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

module.exports = nextConfig;
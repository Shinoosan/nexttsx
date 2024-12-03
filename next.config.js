/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    isrMemoryCacheSize: 0,
  },
  output: 'export',
  trailingSlash: true,
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
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
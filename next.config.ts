import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig: NextConfig = {
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

    // External modules
    config.externals = {
      ...(config.externals as Record<string, string> || {}),
      'abort-controller': 'abort-controller',
    };

    return config;
  }
};

export default nextConfig;
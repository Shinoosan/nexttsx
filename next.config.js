/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        timers: false,
        mongodb: false
      }
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  }
};

module.exports = nextConfig;

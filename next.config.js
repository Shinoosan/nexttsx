module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.m?js$/,
      use: {
        loader: 'next-nodejs-polyfill-loader',
        options: {
          modules: ['timers/promises'],
        },
      },
      exclude: /node_modules\/mongodb/,
    });

    config.module.rules.push({
      test: /node_modules\/mongodb/,
      use: 'null-loader',
    });

    return config;
  },
};
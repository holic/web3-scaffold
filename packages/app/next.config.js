/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  // Allow importing .ts files
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [options.defaultLoaders.babel],
    });

    return config;
  },
};

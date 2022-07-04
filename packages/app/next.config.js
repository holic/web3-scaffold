/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

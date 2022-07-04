/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      process: false,
      util: false,
      zlib: false,
      assert: false,
      stream: false,
    };

    return config;
  },
};

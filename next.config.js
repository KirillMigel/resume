/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/export": ["assets/fonts/**/*"],
    },
  },
};

module.exports = nextConfig;


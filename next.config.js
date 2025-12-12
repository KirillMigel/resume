/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/export": ["public/fonts/**"],
    },
  },
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/export": ["assets/fonts/**/*"],
  },
};

module.exports = nextConfig;


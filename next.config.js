/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/export": ["./node_modules/pdfkit/js/data/**/*.afm"],
    },
  },
};

module.exports = nextConfig;


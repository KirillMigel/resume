/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./node_modules/pdfkit/js/data/**/*"],
      "/api/export": ["./node_modules/pdfkit/js/data/**/*"],
    },
  },
};

module.exports = nextConfig;


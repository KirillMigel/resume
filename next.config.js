/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/export": ["./node_modules/pdfkit/js/data/**/*.afm"],
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.afm$/,
      type: "asset/source",
    });
    return config;
  },
};

module.exports = nextConfig;


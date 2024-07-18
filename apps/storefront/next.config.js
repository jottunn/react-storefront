const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "false",
});

const apiURL = new URL(process.env.NEXT_PUBLIC_API_URI);
const strapiURL = new URL(process.env.NEXT_PUBLIC_STRAPI_URL);
const allowedImageDomains = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS
  ? process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS.split(",")
  : [];

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      { hostname: apiURL.hostname },
      {
        protocol: "http",
        hostname: strapiURL.hostname,
        port: "",
        pathname: "/uploads/**",
      },
      ...allowedImageDomains.map((domain) => ({ hostname: domain })),
    ],

    formats: ["image/webp"],
    minimumCacheTTL: 31536000,
  },
  trailingSlash: false,
  i18n: {
    locales: ["en", "ro"],
    defaultLocale: "ro",
    localeDetection: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "x-content-type-options",
            value: "nosniff",
          },
          { key: "x-xss-protection", value: "1" },
          { key: "x-frame-options", value: "DENY" },
          {
            key: "strict-transport-security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },

      {
        source: "/checkout/(.*)",
        headers: [{ key: "x-frame-options", value: "ALLOWALL" }],
      },

      {
        source: "/graphql/(.*?)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
          },
          { key: "Expires", value: "0" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
  experimental: {},
});

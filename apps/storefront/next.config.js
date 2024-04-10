// eslint-disable-next-line
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const apiURL = new URL(process.env.NEXT_PUBLIC_API_URI);
const allowedImageDomains = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS
  ? process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS.split(",")
  : [];

const checkoutEmbededInStorefrontPath = "/saleor-app-checkout";

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: [apiURL.hostname, ...allowedImageDomains],
    formats: ["image/avif", "image/webp"],
  },
  trailingSlash: true,
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
  async rewrites() {
    return [
      {
        source: "/checkout/",
        destination: `${process.env.NEXT_PUBLIC_CHECKOUT_URL}/`,
      },
      {
        source: `${checkoutEmbededInStorefrontPath}/`,
        destination: `${process.env.NEXT_PUBLIC_CHECKOUT_APP_URL}/`,
      },
      {
        source: `${checkoutEmbededInStorefrontPath}/:path*/`,
        destination: `${process.env.NEXT_PUBLIC_CHECKOUT_APP_URL}/:path*/`,
      },
      {
        source: `${checkoutEmbededInStorefrontPath}/:path*`,
        destination: `${process.env.NEXT_PUBLIC_CHECKOUT_APP_URL}/:path*`,
      },

      {
        source: "/api/manifest",
        destination: `${process.env.NEXT_PUBLIC_CHECKOUT_APP_URL}/api/manifest`,
      },
      {
        source: "/api/install",
        destination: `${process.env.NEXT_PUBLIC_CHECKOUT_APP_URL}/api/install`,
      },
    ];
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/:channel/:locale/account/",
  //       destination: "/[channel]/[locale]/account/preferences",
  //       permanent: true,
  //     },
  //   ];
  // },
  experimental: {},
});

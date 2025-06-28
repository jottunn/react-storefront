const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "false",
});

const apiURL = new URL(process.env.NEXT_PUBLIC_SALEOR_API_URL);
const strapiURL = new URL(process.env.NEXT_PUBLIC_STRAPI_URL);
const allowedImageDomains = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS
  ? process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS.split(",")
  : [];
const fs = require("fs");
const path = require("path");

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  trailingSlash: false,
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
      {
        source: "/(.*)\\.(json|csv)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
    ];
  },
  async redirects() {
    const redirectsPath = path.resolve(__dirname, "redirects.json");
    const rawRedirects = fs.readFileSync(redirectsPath);
    const redirects = JSON.parse(rawRedirects);

    return redirects.map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: true,
    }));
  },
  async rewrites() {
    return [
      {
        source: "/noutati",
        destination: "/new-arrivals",
      },
    ];
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: [
      "algoliasearch",
      "axios",
      "bull",
      "swiper",
      "@bprogress/next",
      "react-dom",
      "@apollo/client",
      "@headlessui/react",
      "@heroicons/react",
      "react-instantsearch",
      "react-hook-form",
      "react-zoom-pan-pinch",
    ],
  },
});

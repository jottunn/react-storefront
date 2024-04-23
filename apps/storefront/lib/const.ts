export const STOREFRONT_NAME =
  process.env.NEXT_PUBLIC_STOREFRONT_NAME || "Surmont - The Bikes Store";
export const CHECKOUT_TOKEN = "checkoutToken";
export const API_URI = process.env.NEXT_PUBLIC_API_URI || "";
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const GEOLOCATION = process.env.NEXT_PUBLIC_GEOLOCATION === "true";
export const UPLOAD_FOLDER = `${
  process.env.NEXT_PUBLIC_API_URI?.replace("graphql/", "") ?? ""
}media/file_upload`;
export const ATTR_COLOR_SLUG = "culoare";
export const ATTR_COLOR_COMMERCIAL_SLUG = "culoare-comerciala";
export const ATTR_GHID_MARIMI = "ghid-marimi";
export const ATTR_BRAND_REF = "brand-ref";

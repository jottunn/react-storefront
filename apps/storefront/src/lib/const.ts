export const STOREFRONT_NAME =
  process.env.NEXT_PUBLIC_STOREFRONT_NAME || "Surmont - The Bike Store";
export const CHECKOUT_TOKEN = "checkoutToken";
export const API_URI = process.env.NEXT_PUBLIC_API_URI || "";
export const BASE_URL = process.env.NEXT_PUBLIC_API_URI?.replace("/graphql/", "");
export const STOREFRONT_URL = process.env.NEXT_PUBLIC_API_URI?.replace(":8000/graphql/", "");
export const UPLOAD_FOLDER = `${BASE_URL ?? ""}/media/file_upload`;
export const ATTR_COLOR_SLUG = "culoare";
export const ATTR_COLOR_COMMERCIAL_SLUG = "culoare-comerciala";
export const ATTR_GHID_MARIMI = "ghid-marimi";
export const ATTR_BRAND_REF = "brand-ref";

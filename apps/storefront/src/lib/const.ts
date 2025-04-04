export const STOREFRONT_NAME =
  process.env.NEXT_PUBLIC_STOREFRONT_NAME || "Surmont - The Bike Store";
export const CHECKOUT_TOKEN = "checkoutToken";
export const API_URI = process.env.NEXT_PUBLIC_API_URI || "";
export const BASE_URL = process.env.NEXT_PUBLIC_API_URI?.replace("/graphql/", "");
export const STOREFRONT_URL = API_URI.replace(/^(https?:\/\/[^/]+).*/, "$1");
export const GOOGLE_STORAGE_URL = "https://storage.googleapis.com/";
export const UPLOAD_FOLDER = `${GOOGLE_STORAGE_URL}${process.env.NEXT_PUBLIC_GS_MEDIA_BUCKET_NAME}/file_upload`;
export const ATTR_COLOR_SLUG = "culoare";
export const ATTR_COLOR_COMMERCIAL_SLUG = "culoare-comerciala";
export const ATTR_GHID_MARIMI = "ghid-marimi";
export const ATTR_BRAND_REF = "brand-ref";
export const PAGE_TYPE_HP_BANNERS_ID = process.env.PAGE_TYPE_HPBANNERS;
export const PAGE_TYPE_HP_CAROUSEL_ID = process.env.PAGE_TYPE_CAROUSEL;
export const ATTR_GEN_ID = process.env.NEXT_PUBLIC_ATTR_GEN_ID || "";
export const GRAPHQL_PAGINATION_LIMIT = process.env.NEXT_PUBLIC_GRAPHQL_PAGINATION_LIMIT || 100;

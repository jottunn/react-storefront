export const STOREFRONT_TITLE = "Biciclete, Accesorii & Echipament pentru bicicleta - Surmont.ro";
export const STOREFRONT_NAME =
  process.env.NEXT_PUBLIC_STOREFRONT_NAME || "Surmont - The Bikes Store";
export const CHECKOUT_TOKEN = "checkoutToken";
export const API_URI = process.env.NEXT_PUBLIC_SALEOR_API_URL || "";
export const STOREFRONT_URL = API_URI.match(/^(https?:\/\/[^/?#]+)/i)?.[0].replace("api.", "");
export const GOOGLE_STORAGE_URL = "https://storage.googleapis.com/";
export const UPLOAD_FOLDER = `${GOOGLE_STORAGE_URL}${process.env.NEXT_PUBLIC_GS_MEDIA_BUCKET_NAME}/file_upload`;
export const ATTR_COLOR_SLUG = "culoare";
export const ATTR_COLOR_COMMERCIAL_SLUG = "culoare-comerciala";
export const ATTR_GHID_MARIMI = "ghid-marimi";
export const PAGE_TYPE_HP_BANNERS_ID = process.env.PAGE_TYPE_HPBANNERS;
export const PAGE_TYPE_HP_CAROUSEL_ID = process.env.PAGE_TYPE_CAROUSEL;
export const ATTR_GEN_ID = process.env.NEXT_PUBLIC_ATTR_GEN_ID || "";
export const GRAPHQL_PAGINATION_LIMIT = process.env.NEXT_PUBLIC_GRAPHQL_PAGINATION_LIMIT || 100;

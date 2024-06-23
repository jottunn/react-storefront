import { fetchAPI } from "./fetch-api";

export async function getPageBySlug(slug: string, lang: string) {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  const path = `/pages`;
  const urlParamsObject = {
    filters: { slug },
    populate: {
      pageContent: {
        populate: "*",
      },
      seo: {
        populate: "*",
      },
      media: {
        populate: "*",
      },
      hero: {
        fields: "*",
      },
    },
  };
  const options = { headers: { Authorization: `Bearer ${token}` } };
  return await fetchAPI(path, urlParamsObject, options);
}

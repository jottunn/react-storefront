import { fetchAPI } from "./fetch-api";

export async function getCollectionBySlug(
  collectionSlug: string,
  lang: string,
  start: number,
  limit: number,
  queryFilters?: {} | undefined,
  populate?: {} | undefined,
) {
  const token = process.env.STRAPI_API_TOKEN;

  const path = `/${collectionSlug}`;
  const urlParamsObject = {
    sort: { createdAt: "desc" },
    ...(queryFilters && Object.keys(queryFilters).length > 0 && { filters: queryFilters }),
    ...(populate && Object.keys(populate).length > 0 && { populate: populate }),
    pagination: {
      start: start,
      limit: limit,
    },
  };
  const options = { headers: { Authorization: `Bearer ${token}` } };
  return await fetchAPI(path, urlParamsObject, options);
}

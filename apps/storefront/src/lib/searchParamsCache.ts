import { createSearchParamsCache, parseAsInteger, parseAsString } from "nuqs/server";

// Define the main search params to be used across pages
export const productSearchParams = {
  filters: parseAsString.withDefault(""),
  sortBy: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

// Create a cache for product search params
export const productSearchParamsCache = createSearchParamsCache(productSearchParams);

// Type for URL filters used in several product listing pages
export interface UrlFilter {
  slug: string;
  values: string[];
}

// Function to parse query attribute filters (shared across pages) ?filters=culoare--rosu,albastru,dark-gray_gen--copii
export function parseQueryAttributeFilters(query: string): UrlFilter[] {
  const filters = query.split("_").flatMap((attributeWithValues) => {
    const splitted = attributeWithValues.split("--");
    const splittedValues = splitted[1].split(",");
    const attributeFilter: UrlFilter = { slug: splitted[0], values: splittedValues };
    if (attributeFilter.values.length > 0) {
      return [attributeFilter];
    }
    return [];
  });
  return filters;
}

// For extending with additional search params in the future
export function createExtendedSearchParamsCache(additionalParams: Record<string, any>) {
  return createSearchParamsCache({
    ...productSearchParams,
    ...additionalParams,
  });
}

// Ensure this file is treated as a module
export default {};

import { type ReactNode } from "react";
import { type SearchParams } from "nuqs/server";
import {
  productSearchParamsCache,
  parseQueryAttributeFilters,
  type UrlFilter,
} from "@/lib/searchParamsCache";

interface SearchParamsProviderProps {
  searchParams: SearchParams;
  children: (processedParams: {
    filtersString: string;
    sortBy: string;
    filters: UrlFilter[];
  }) => ReactNode;
}

/**
 * A server component that processes search parameters and passes them to children
 *
 * Usage example:
 * ```tsx
 * <SearchParamsProvider searchParams={searchParams}>
 *   {({ filtersString, sortBy, filters }) => (
 *     <YourComponent
 *       filters={filters}
 *       sortBy={sortBy}
 *     />
 *   )}
 * </SearchParamsProvider>
 * ```
 */
export async function SearchParamsProvider({ searchParams, children }: SearchParamsProviderProps) {
  // Parse the search parameters
  await productSearchParamsCache.parse(searchParams);

  // Get the processed values
  const filtersString = productSearchParamsCache.get("filters");
  const sortBy = productSearchParamsCache.get("sortBy");

  // Parse the filters string into structured filters
  const filters = filtersString ? parseQueryAttributeFilters(filtersString) : [];

  // Render children with the processed search params
  return <>{children({ filtersString, sortBy, filters })}</>;
}

/**
 * Processes search parameters without requiring a component
 * For use in server components and page.tsx files directly
 */
export async function processSearchParams(searchParams: SearchParams) {
  try {
    await productSearchParamsCache.parse(searchParams);
    const filtersString = productSearchParamsCache.get("filters");
    const sortBy = productSearchParamsCache.get("sortBy");
    const filters = filtersString ? parseQueryAttributeFilters(filtersString) : [];

    return { filtersString, sortBy, filters };
  } catch (error) {
    console.error("Error processing search params:", error);
    return {
      filtersString: "",
      sortBy: "",
      filters: [],
    };
  }
}

// Export the productSearchParams for use with useQueryStates in client components
export { productSearchParams } from "@/lib/searchParamsCache";

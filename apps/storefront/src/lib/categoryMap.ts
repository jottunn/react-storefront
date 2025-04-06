import {
  CategoriesSortedByDocument,
  CategoriesSortedByQuery,
  CategorySortingInput,
  LanguageCodeEnum,
} from "@/saleor/api";
import { executeGraphQL } from "./graphql";
import { defaultRegionQuery } from "./regions";
import { mapEdgesToItems } from "./maps";

let categorySlugMap: Map<string, string> | null = null;

export async function getCategorySlugMap(): Promise<Map<string, string> | undefined> {
  if (categorySlugMap) return categorySlugMap;
  try {
    const categorySortBy: CategorySortingInput = {
      direction: "DESC",
      field: "PRODUCT_COUNT",
    };

    const response = await executeGraphQL<
      CategoriesSortedByQuery,
      { sortBy: CategorySortingInput; locale: LanguageCodeEnum }
    >(CategoriesSortedByDocument, {
      variables: {
        sortBy: categorySortBy,
        ...defaultRegionQuery(),
      },
      withAuth: false,
      revalidate: 60 * 60 * 24,
    });

    const categories = mapEdgesToItems(response.categories);
    categorySlugMap = new Map(
      categories
        .filter((category) => category.slug && category.id)
        .map((category) => [category.slug!, category.id!]),
    );

    return categorySlugMap;
  } catch (error) {
    console.error("Error fetching category map:", error);
    return undefined;
  }
}

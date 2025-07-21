import { MetadataRoute } from "next";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
import {
  CategoriesSortedByDocument,
  CategoriesSortedByQuery,
  CategorySortingInput,
  CollectionSortingInput,
  CollectionsSortedByDocument,
  CollectionsSortedByQuery,
  LanguageCodeEnum,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
} from "@/saleor/api";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { ATTR_COLOR_COMMERCIAL_SLUG, GRAPHQL_PAGINATION_LIMIT, STOREFRONT_URL } from "@/lib/const";
import { defaultRegionQuery } from "@/lib/regions";

export async function getSitemapCategories() {
  try {
    const categorySortBy: CategorySortingInput = {
      direction: "DESC",
      field: "PRODUCT_COUNT",
    };
    const { categories } = await executeGraphQL<
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
    if (categories) {
      const sitemapCategories = categories ? mapEdgesToItems(categories) : [];
      const categoryUrls = sitemapCategories.map(({ slug, updatedAt }) => ({
        url: `${STOREFRONT_URL}/c/${slug}`,
        lastModified: updatedAt
          ? new Date(updatedAt).toISOString().replace(/\.\d+Z$/, "Z")
          : new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        changeFrequency: "daily" as "daily",
      }));
      return [...categoryUrls];
    }
  } catch (err) {
    //console.error("Error Sitemap:", err);
  }
  return [];
}

export async function getSitemapCollections() {
  try {
    const collectionSortBy: CollectionSortingInput = {
      direction: "DESC",
      field: "PRODUCT_COUNT",
    };
    const { collections } = await executeGraphQL<
      CollectionsSortedByQuery,
      { sortBy: CollectionSortingInput; locale: LanguageCodeEnum }
    >(CollectionsSortedByDocument, {
      variables: {
        sortBy: collectionSortBy,
        ...defaultRegionQuery(),
      },
      withAuth: false,
      revalidate: 60 * 60 * 24,
    });
    if (collections) {
      const sitemapCollections = collections ? mapEdgesToItems(collections) : [];
      const collectionUrls = sitemapCollections.map(({ slug }) => ({
        url: `${STOREFRONT_URL}/collections/${slug}`,
        lastModified: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        changeFrequency: "daily" as "daily",
      }));
      return [...collectionUrls];
    }
  } catch (err) {
    //  console.error("Error sitemap:", err);
  }
  return [];
}
type QueryVariables = {
  filter: ProductFilterInput;
  first: any;
  after?: string | null;
};
export async function getSitemapProducts() {
  try {
    const filter: ProductFilterInput = {
      isPublished: true,
      stockAvailability: "IN_STOCK",
      isVisibleInListing: true,
    };

    let hasNextPage = true;
    let afterCursor: string | null = null;
    const allProducts: any[] = [];

    while (hasNextPage) {
      const queryVariables: QueryVariables = {
        filter,
        first: GRAPHQL_PAGINATION_LIMIT,
        after: afterCursor,
        ...defaultRegionQuery(),
      };

      const { products } = await executeGraphQL<ProductCollectionQuery, { filter: any }>(
        ProductCollectionDocument,
        {
          variables: queryVariables,
          withAuth: false,
          revalidate: 60 * 60 * 24,
        },
      );
      if (!products || !products.edges.length) {
        console.log("No more products found");
        break;
      }

      // Add the current page's products to the allProducts array
      allProducts.push(...products.edges);

      // Update pagination variables
      hasNextPage = products.pageInfo.hasNextPage;
      afterCursor = products.pageInfo.endCursor ?? null;
    }

    if (allProducts.length === 0) {
      console.log("No products found");
      return [];
    }

    // Map edges to items and group products by color
    let sitemapProducts = mapEdgesToItems({ edges: allProducts }) as any;
    sitemapProducts = groupProductsByColor(sitemapProducts as GroupedProduct[]);

    // Generate product URLs for the sitemap
    const productUrls = [];
    for (const product of sitemapProducts) {
      const checkProductVariant = product.variants?.filter(
        (variant: { quantityAvailable: number | null }) =>
          variant.quantityAvailable != null && variant.quantityAvailable > 0,
      );
      const variant = checkProductVariant?.[0];
      const colorVariant = variant?.attributes.find(
        (attr: { attribute: { slug: string } }) =>
          attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
      );
      const colorValue = colorVariant?.values[0]?.["slug"] || "";
      productUrls.push({
        sku: variant?.sku,
        url: `${STOREFRONT_URL}/p/${product.slug}${colorValue ? `--${colorValue}` : ""}`,
        lastModified: variant?.updatedAt
          ? new Date(variant.updatedAt).toISOString().replace(/\.\d+Z$/, "Z")
          : new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        changeFrequency: "daily" as "daily",
      });
    }

    return [...productUrls];
  } catch (err) {
    console.error("Error in getSitemapProducts:", err);
  }
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/outlet",
    "/contact",
    "/service-biciclete",
    "/magazin",
    "/faq",
    "/ghid-marimi",
    "/brands",
    "/blog",
  ].map((route) => ({
    url: `${STOREFRONT_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as "weekly",
  }));

  const [categoriesRoutes, collectionsRoutes, productsRoutes] = await Promise.all([
    getSitemapCategories(),
    getSitemapCollections(),
    getSitemapProducts(),
  ]);
  return [...staticRoutes, ...categoriesRoutes, ...collectionsRoutes, ...productsRoutes];
}

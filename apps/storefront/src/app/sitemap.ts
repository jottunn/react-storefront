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
import { BASE_URL } from "@/lib/const";
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
        url: `${BASE_URL}/c/${slug}`,
        lastModified: updatedAt,
      }));
      return [...categoryUrls];
    }
  } catch (err) {
    console.error("Error:", err);
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
        url: `${BASE_URL}/collections/${slug}`,
        lastModified: new Date().toISOString(),
      }));
      return [...collectionUrls];
    }
  } catch (err) {
    console.error("Error:", err);
  }
  return [];
}

export async function getSitemapProducts() {
  try {
    const filter: ProductFilterInput = {
      isPublished: true,
      stockAvailability: "IN_STOCK",
      isVisibleInListing: true,
    };
    const queryVariables = {
      filter,
      first: 700,
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
    if (products) {
      let sitemapProducts = products ? mapEdgesToItems(products) : [];
      sitemapProducts = groupProductsByColor(sitemapProducts as GroupedProduct[]);
      const productUrls = sitemapProducts.map((product) => {
        const checkProductVariant = product.variants?.filter(
          (variant) => variant.quantityAvailable != null && variant.quantityAvailable > 0,
        );
        const variant = checkProductVariant?.[0];
        return {
          url: `${BASE_URL}/p/${product.slug}?variant=${variant?.id}`,
          lastModified: variant?.updatedAt,
        };
      });
      return [...productUrls];
    }
  } catch (err) {
    console.error("Error:", err);
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
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
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

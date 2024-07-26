import { MetadataRoute } from "next";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
import { defaultRegionQuery } from "@/lib/regions";
import {
  CategoriesSortedByDocument,
  CategoriesSortedByQuery,
  CategorySortingInput,
  CollectionSortingInput,
  CollectionsSortedByDocument,
  CollectionsSortedByQuery,
  LanguageCodeEnum,
} from "@/saleor/api";
import { getProductCollection } from "./actions";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
async function getCatgeories() {
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
      revalidate: 60 * 60 * 24,
    });
    const sitemapCategories = categories ? mapEdgesToItems(categories) : [];
    const categoryUrls = sitemapCategories.map(({ slug, updatedAt }) => ({
      url: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/c/${slug}`,
      lastModified: updatedAt,
    }));
    return [...categoryUrls];
  } catch (err) {
    console.error("Error:", err);
  }
  return [];
}

async function getCollections() {
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
      revalidate: 60 * 60 * 24,
    });
    const sitemapCollections = collections ? mapEdgesToItems(collections) : [];
    const collectionUrls = sitemapCollections.map(({ slug }) => ({
      url: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/collections/${slug}`,
      lastModified: new Date().toISOString(),
    }));
    return [...collectionUrls];
  } catch (err) {
    console.error("Error:", err);
  }
  return [];
}

async function getProducts() {
  const queryVariables = {
    stockAvailability: "IN_STOCK",
    isPublished: true,
    isVisibleInListing: true,
    first: 700,
    ...defaultRegionQuery(),
  };
  try {
    const products = await getProductCollection(queryVariables);
    if (products) {
      let sitemapProducts = products ? mapEdgesToItems(products) : [];
      sitemapProducts = groupProductsByColor(sitemapProducts as GroupedProduct[]);
      const productUrls = sitemapProducts.map((product) => {
        const checkProductVariant = product.variants?.filter(
          (variant) => variant.quantityAvailable != null && variant.quantityAvailable > 0,
        );
        const variant = checkProductVariant?.[0];
        return {
          url: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/p/${product.slug}?variant=${variant?.id}`,
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
    url: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as "weekly",
  }));

  const categoriesRoutes = await getCatgeories();
  const collectionsRoutes = await getCollections();
  const productssRoutes = await getProducts();
  return [...staticRoutes, ...categoriesRoutes, ...collectionsRoutes, ...productssRoutes];
}

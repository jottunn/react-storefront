import { notFound } from "next/navigation";
import { executeGraphQL } from "src/lib/graphql";
import {
  CategoryBySlugDocument,
  CategoryBySlugQuery,
  LanguageCodeEnum,
  CategoriesSortedByDocument,
  CategoriesSortedByQuery,
  CategorySortingInput,
  ProductBySlugDocument,
} from "@/saleor/api";
import { DEFAULT_CHANNEL, DEFAULT_LOCALE } from "@/lib/regions";
import PageHero from "@/components/PageHero";
import { translate } from "@/lib/translations";
import { mapEdgesToItems } from "@/lib/maps";
import { getMessages, getOrderValue } from "@/lib/util";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
import ToggleDescription from "@/components/ToggleDescription";
import { processSearchParams } from "@/components/searchParams/SearchParamsProvider";
import { getProductCollectionData } from "src/app/actions";
import Products from "@/components/productList/products";
import { type Metadata } from "next";

// Make the page explicitly dynamic to handle nuqs searchParams
export const dynamic = "force-dynamic";

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | []> => {
  const params = "then" in props.params ? await props.params : props.params;
  let category;
  try {
    const response = await executeGraphQL<
      any,
      { slug: string; locale: LanguageCodeEnum; channel: string }
    >(CategoryBySlugDocument, {
      variables: { slug: params.slug, locale: DEFAULT_LOCALE, channel: DEFAULT_CHANNEL.slug },
      revalidate: 60 * 60 * 24,
    });
    category = response.category;
  } catch {
    return [];
  }

  return {
    title: category && (category.seoTitle || `${category.name} | ${STOREFRONT_NAME}`),
    description:
      category && (category.seoDescription || `${category.name} pe magazinul online Surmont.ro`),
    alternates: {
      canonical: STOREFRONT_URL
        ? STOREFRONT_URL + `/c/${encodeURIComponent(params.slug)}`
        : undefined,
    },
    openGraph: {
      title: category && (category.seoTitle || `${category.name} | ${STOREFRONT_NAME}`),
      description:
        category && (category.seoDescription || `${category.name} pe magazinul online Surmont.ro`),
      images: category &&
        category.backgroundImage && [
          {
            url: category.backgroundImage.url,
            width: "670",
            height: "425",
            alt: category.backgroundImage.alt || category.name,
          },
        ],
    },
  };
};

export async function generateStaticParams() {
  try {
    const categorySortBy: CategorySortingInput = {
      direction: "DESC",
      field: "PRODUCT_COUNT",
    };

    const response = await executeGraphQL<
      CategoriesSortedByQuery,
      { sortBy: CategorySortingInput; locale: LanguageCodeEnum; channel: string }
    >(CategoriesSortedByDocument, {
      variables: {
        sortBy: categorySortBy,
        locale: DEFAULT_LOCALE,
        channel: DEFAULT_CHANNEL.slug,
      },
      revalidate: 60 * 60 * 24,
    });

    // Check if categories exist before mapping
    if (!response.categories) {
      return [];
    }

    const categories = mapEdgesToItems(response.categories);

    // Return top 10 categories with most products
    return categories
      .filter(
        (category) =>
          category.slug && category.products?.totalCount && category.products.totalCount > 0,
      )
      .slice(0, 10)
      .map((category) => ({
        slug: category.slug,
      }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  let category;
  try {
    const response = await executeGraphQL<
      CategoryBySlugQuery,
      { slug: string; locale: LanguageCodeEnum; channel: string }
    >(CategoryBySlugDocument, {
      variables: { slug, locale: DEFAULT_LOCALE, channel: DEFAULT_CHANNEL.slug },
      revalidate: 60 * 5,
    });
    category = response.category;
  } catch {
    return [];
  }
  if (!category) {
    notFound();
  }

  const messages = getMessages(DEFAULT_LOCALE);
  const parentCategories = mapEdgesToItems(category?.ancestors);
  const subcategories = mapEdgesToItems(category?.children);
  //filter out categories with no products and sort
  const filteredAndSortedSubcategories = subcategories
    .filter(
      (subcategory) => subcategory.products?.totalCount && subcategory.products?.totalCount > 0,
    )
    .sort((a, b) => getOrderValue(a.metadata) - getOrderValue(b.metadata));

  const parents = parentCategories.map((parentCategory) => ({
    label: translate(parentCategory, "name"),
    slug: parentCategory.slug,
  }));

  const breadcrumbItems = [{ name: "Home", href: "/" }];
  parents.forEach((parent) => {
    breadcrumbItems.push({
      name: parent.label,
      href: `/c/${parent.slug}`,
    });
  });
  breadcrumbItems.push({ name: translate(category, "name"), href: "" });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href ? `${STOREFRONT_URL}${item.href}` : undefined,
    })),
  };

  // Process search params using our reusable function
  const { filtersString, sortBy, filters } = await processSearchParams(searchParams);

  // Get product collection data
  const productCollection = await getProductCollectionData({
    filters,
    sortBy,
    categoryIDs: [category.id],
    messages,
  });

  return (
    <>
      <Script
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <header className="border-b border-main-6">
        <div className="bg-main-7 border-b md:mb-2">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container p-6">
          <PageHero
            title={translate(category, "name")}
            pills={filteredAndSortedSubcategories.map((subcategory) => ({
              label: translate(subcategory, "name"),
              slug: subcategory.slug,
            }))}
          />
        </div>
      </header>
      <main>
        <div className="container px-6 mt-4 mb-12 md:mb-40 min-h-[600px]">
          <Products
            productCollection={productCollection}
            messages={messages}
            categoryIDs={[category.id]}
            categorySlug={slug}
          />
        </div>
        {category.description && (
          <ToggleDescription
            description={translate(category, "description") || ""}
            messages={messages}
          />
        )}
      </main>
    </>
  );
}

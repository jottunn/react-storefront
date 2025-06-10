import { notFound } from "next/navigation";
import { type Metadata } from "next";
import Script from "next/script";
import { executeGraphQL } from "src/lib/graphql";
import { CollectionBySlugDocument, CollectionBySlugQuery, LanguageCodeEnum } from "@/saleor/api";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import PageHero from "@/components/PageHero";
import { translate } from "@/lib/translations";
import { getMessages } from "@/lib/util";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToggleDescription from "@/components/ToggleDescription";
import { processSearchParams } from "@/components/searchParams/SearchParamsProvider";
import { getProductCollectionData } from "src/app/actions";
import Products from "@/components/productList/products";

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | []> => {
  const params = await props.params;
  let collection;
  try {
    const response = await executeGraphQL<
      CollectionBySlugQuery,
      { slug: string; locale: LanguageCodeEnum; channel: string }
    >(CollectionBySlugDocument, {
      variables: { slug: params.slug, ...defaultRegionQuery() },
      revalidate: 60 * 60 * 24,
    });
    collection = response.collection as any;
  } catch {
    return [];
  }

  return {
    title: collection && (collection.seoTitle || `${collection.name} | ${STOREFRONT_NAME}`),
    description:
      collection &&
      (collection.seoDescription || `${collection.name} pe magazinul online Surmont.ro`),
    alternates: {
      canonical: STOREFRONT_URL
        ? STOREFRONT_URL + `/c/${encodeURIComponent(params.slug)}`
        : undefined,
    },
    openGraph: {
      title: collection && (collection.seoTitle || `${collection.name} | ${STOREFRONT_NAME}`),
      description:
        collection &&
        (collection.seoDescription || `${collection.name} pe magazinul online Surmont.ro`),
      images: collection &&
        collection.backgroundImage && [
          {
            url: collection.backgroundImage.url,
            width: "600",
            height: "485",
            alt: collection.backgroundImage.alt || collection.name,
          },
        ],
    },
  };
};

export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  let collection;
  try {
    const response = await executeGraphQL<
      CollectionBySlugQuery,
      { slug: string; locale: LanguageCodeEnum; channel: string }
    >(CollectionBySlugDocument, {
      variables: { slug, ...defaultRegionQuery() },
      revalidate: 60,
    });
    collection = response.collection;
  } catch {
    return [];
  }

  if (!collection) {
    notFound();
  }
  const messages = getMessages(DEFAULT_LOCALE);

  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: translate(collection, "name") }];
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

  const { sortBy, filters } = await processSearchParams(searchParams);

  // Get product collection data
  const productCollection = await getProductCollectionData({
    filters,
    sortBy,
    collectionIDs: [collection.id],
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
      <header className="mb-4 border-b border-main-6">
        <div className="bg-main-7 border-b md:mb-2">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container p-6">
          <PageHero title={translate(collection, "name")} />
        </div>
      </header>
      <main>
        <div className="container px-6 mt-4 mb-40 min-h-[600px]">
          <Products
            productCollection={productCollection}
            messages={messages}
            collectionIDs={[collection.id]}
          />
        </div>
        {collection.description && (
          <ToggleDescription
            description={translate(collection, "description") || ""}
            messages={messages}
          />
        )}
      </main>
    </>
  );
}

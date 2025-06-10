import React from "react";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import {
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  LanguageCodeEnum,
} from "@/saleor/api";
import { getMessages, getNumColumns, getOrderValue } from "@/lib/util";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
import PageHero from "@/components/PageHero";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
import HomepageBlock from "@/components/homepage/HomepageBlock";
import AnchorScroller from "@/components/AnchorScroller";
import Products from "@/components/productList/products";
import { processSearchParams } from "@/components/searchParams/SearchParamsProvider";
import { getProductCollectionData } from "../actions";

export const metadata = {
  title: `Reduceri | ${STOREFRONT_NAME}`,
  description: "Reduceri la Surmont.ro",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/outlet` : undefined,
  },
};

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  let collections;
  try {
    const result = await executeGraphQL<
      CollectionsByMetaKeyQuery,
      { filter: any; locale: LanguageCodeEnum; channel: string }
    >(CollectionsByMetaKeyDocument, {
      variables: {
        filter: {
          metadata: [{ key: "isSale", value: "YES" }],
          published: "PUBLISHED",
        },
        ...defaultRegionQuery(),
      },
      revalidate: 60,
    });
    collections = result.collections;
  } catch {
    return null;
  }

  const outletCollections = mapEdgesToItems(collections);
  outletCollections.sort((a, b) => getOrderValue(a.metadata) - getOrderValue(b.metadata));
  const outletCollectionsWithImage = outletCollections.filter(
    (collection) => collection.backgroundImage && collection.backgroundImage.url,
  );
  const numColumnsHPCollections =
    outletCollectionsWithImage.length > 1 ? getNumColumns(outletCollectionsWithImage.length) : 1;
  const collectionsIds = outletCollections && outletCollections.map((collect) => collect.id);
  const messages = getMessages(DEFAULT_LOCALE);
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: messages["app.search.outletTitle"] },
  ];
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
    collectionIDs: collectionsIds,
    messages,
  });

  return (
    <>
      <AnchorScroller />
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
          <PageHero title={messages["app.search.outletTitle"]} />
          {outletCollectionsWithImage && outletCollectionsWithImage.length > 0 && (
            <div
              className={`${numColumnsHPCollections === 1 ? "flex flex-col items-center" : `grid grid-cols-1 md:grid-cols-${numColumnsHPCollections}`} gap-4 mt-4 mb-20`}
            >
              {outletCollectionsWithImage.map((collection) => (
                <HomepageBlock key={collection.id} item={collection} type="collection" />
              ))}
            </div>
          )}
        </div>
      </header>
      <div
        className="container px-8 mt-4 mb-40 scroll-mt-[100px] md:scroll-mt-[130px]"
        id="products"
      >
        {collectionsIds.length > 0 ? (
          <Products
            productCollection={productCollection}
            messages={messages}
            collectionIDs={collectionsIds}
          />
        ) : (
          <p className="text-md text-center">No sales at the moment</p>
        )}
      </div>
    </>
  );
}

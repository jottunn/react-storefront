import React from "react";
import { FilteredProductList } from "@/components/productList/FilteredProductList";
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
import { STOREFRONT_NAME } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
import HomepageBlock from "@/components/homepage/HomepageBlock";

export const metadata = {
  title: `Reduceri | ${STOREFRONT_NAME}`,
  description: "Reduceri la Surmont.ro",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
      ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/outlet`
      : undefined,
  },
};

export default async function Page() {
  const { collections } = await executeGraphQL<
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
  const outletCollections = mapEdgesToItems(collections);
  outletCollections.sort((a, b) => getOrderValue(a.metadata) - getOrderValue(b.metadata));
  const outletCollectionsWithImage = outletCollections.filter(
    (collection) => collection.backgroundImage && collection.backgroundImage.url,
  );
  const numColumnsHPCollections = getNumColumns(outletCollectionsWithImage.length);
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
      item: item.href ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}${item.href}` : undefined,
    })),
  };
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
        <div className="bg-main-7 border-b md:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container px-8">
          <PageHero title={messages["app.search.outletTitle"]} description="" />
          {outletCollectionsWithImage && outletCollectionsWithImage.length > 0 && (
            <div
              className={`grid grid-cols-1 md:grid-cols-${numColumnsHPCollections} gap-4 mt-20 mb-40 ${
                numColumnsHPCollections === 1 ? "flex flex-col items-center" : ""
              }`}
            >
              {outletCollectionsWithImage.map((collection) => (
                <HomepageBlock key={collection.id} item={collection} type="collection" />
              ))}
            </div>
          )}
        </div>
      </header>
      <div className="container px-8 mt-4 mb-40">
        {collectionsIds.length > 0 ? (
          <FilteredProductList collectionIDs={collectionsIds} messages={messages} />
        ) : (
          <p className="text-md text-center">No sales at the moment</p>
        )}
      </div>
    </>
  );
}

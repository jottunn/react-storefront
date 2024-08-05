import React from "react";
import { FilteredProductList } from "@/components/productList/FilteredProductList";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import {
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
  ProductOrder,
} from "@/saleor/api";
import { getMessages } from "@/lib/util";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
import PageHero from "@/components/PageHero";
import { UrlSorting } from "@/components/productList/sorting";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";

export const metadata = {
  title: `Noutăți | ${STOREFRONT_NAME}`,
  description: "Cele mai noi articole de la Surmont.ro",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/new-arrivals` : undefined,
  },
};

export default async function Page() {
  const filter: ProductFilterInput = { isPublished: true, stockAvailability: "IN_STOCK" };
  const sortBy: ProductOrder = { direction: "DESC", field: "PUBLICATION_DATE" };
  const queryVariables = {
    filter,
    first: 100,
    ...defaultRegionQuery(),
    sortBy,
  };
  const { products: newProductsH } = await executeGraphQL<ProductCollectionQuery, { filter: any }>(
    ProductCollectionDocument,
    {
      variables: queryVariables,
      revalidate: 60,
    },
  );
  let newProducts = newProductsH ? mapEdgesToItems(newProductsH) : [];
  const daysAgo45 = new Date();
  const currentDate = new Date();
  daysAgo45.setDate(currentDate.getDate() - 45);
  newProducts = newProducts.filter((prod) => {
    const purchaseDate = prod.availableForPurchaseAt && new Date(prod.availableForPurchaseAt);
    if (purchaseDate && purchaseDate <= daysAgo45) {
      return prod;
    }
  });
  const newProductsIds = newProducts.map((e) => e.id);
  const messages = getMessages(DEFAULT_LOCALE);
  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: messages["app.newProducts"] }];
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
          <PageHero title={messages["app.newProducts"]} description="" />
        </div>
      </header>
      <div className="container px-8 mt-4 mb-40">
        {newProductsIds.length > 0 ? (
          <FilteredProductList productsIDs={newProductsIds} messages={messages} />
        ) : (
          <FilteredProductList sort={sortBy as UrlSorting} messages={messages} />
        )}
      </div>
    </>
  );
}

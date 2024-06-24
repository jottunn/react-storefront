import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { executeGraphQL } from "src/lib/graphql";
import { CollectionBySlugDocument, CollectionBySlugQuery, LanguageCodeEnum } from "@/saleor/api";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import PageHero from "@/components/PageHero";
import { translate } from "@/lib/translations";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { getMessages } from "@/lib/util";
import Link from "next/link";
import { STOREFRONT_NAME } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> => {
  const response = await executeGraphQL<
    CollectionBySlugQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(CollectionBySlugDocument, {
    variables: { slug: params.slug, ...defaultRegionQuery() },
    revalidate: 60 * 60 * 24,
  });
  const collection = response.collection as any;

  return {
    title: collection && (collection.seoTitle || `${collection.name} | ${STOREFRONT_NAME}`),
    description:
      collection &&
      (collection.seoDescription || `${collection.name} pe magazinul online Surmont.ro`),
    alternates: {
      canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
        ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/c/${encodeURIComponent(params.slug)}`
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

export default async function Page({ params }: { params: { slug: string } }) {
  const { collection } = await executeGraphQL<
    CollectionBySlugQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(CollectionBySlugDocument, {
    variables: { slug: params.slug, ...defaultRegionQuery() },
    revalidate: 60,
  });

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
        <div className="container px-8 p-4">
          <PageHero
            title={translate(collection, "name")}
            description={translate(collection, "description") || ""}
          />
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-40 min-h-[600px]">
          <FilteredProductList collectionIDs={[collection.id]} messages={messages} />
        </div>
      </main>
    </>
  );
}

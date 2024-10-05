import Breadcrumbs from "@/components/Breadcrumbs";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import { executeGraphQL } from "@/lib/graphql";
import { defaultRegionQuery } from "@/lib/regions";
import { CollectionsByMetaKeyDocument, CollectionsByMetaKeyQuery } from "@/saleor/api";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: `Branduri | ${STOREFRONT_NAME}`,
  description: "Alege cele mai cunoscute Branduri: Trek, ION, Bontrager, Shimano",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/brands` : undefined,
  },
};

export default async function Page() {
  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: "Brands" }];
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
  let brandCollections;
  try {
    brandCollections = await executeGraphQL<
      CollectionsByMetaKeyQuery,
      { filter: any; channel: string; locale: string }
    >(CollectionsByMetaKeyDocument, {
      variables: {
        filter: {
          metadata: [{ key: "isBrand", value: "YES" }],
          published: "PUBLISHED",
        },
        ...defaultRegionQuery(),
      },
      revalidate: 60 * 60 * 24,
    });
  } catch {
    return null;
  }

  return (
    <>
      <Script
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <header className="mb-4 pb-6 border-b border-main-6">
        <div className="bg-main-7 border-b md:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container px-8">
          <PageHero title="Brands" description="" />
        </div>
      </header>
      <div className="container px-8 mt-8 mb-40">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 md:gap-12 lg:gap-20 py-12 md:py-32 mb-20 items-center justify-items-center w-full md:min-h-[90px]">
          {brandCollections &&
            brandCollections.collections?.edges.map((brand) => {
              return (
                <Link
                  key={brand.node.slug}
                  title={brand.node.name}
                  href={`/collections/${brand.node.slug}`}
                  className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block"
                >
                  {brand.node.backgroundImage ? (
                    <Image
                      src={brand.node.backgroundImage.url}
                      alt={brand.node.name}
                      width={200}
                      height={200}
                      className="hover:brightness-125 hover:contrast-115 transition-all duration-30"
                    />
                  ) : (
                    brand.node.name
                  )}
                </Link>
              );
            })}
        </div>
      </div>
    </>
  );
}

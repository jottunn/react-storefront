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
      { filter: any; channel: string; locale: string; productFilter: any }
    >(CollectionsByMetaKeyDocument, {
      variables: {
        filter: {
          metadata: [{ key: "isBrand", value: "YES" }],
          published: "PUBLISHED",
        },
        productFilter: {
          stockAvailability: "IN_STOCK",
          isVisibleInListing: true,
        },
        ...defaultRegionQuery(),
      },
      revalidate: 60,
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
      <header className="mb-4 border-b border-main-6">
        <div className="bg-main-7 border-b md:mb-2">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container p-6">
          <PageHero title="Brands" />
        </div>
      </header>

      <div className="container px-8 pt-12 mb-40">
        <div className="container md:flex flex-col gap-6 md:gap-12 lg:gap-20">
          {brandCollections &&
            (() => {
              const filteredCollections =
                brandCollections.collections?.edges.filter(
                  (edge) => edge.node?.products?.totalCount !== 0,
                ) || [];

              const totalBrands = filteredCollections.length;
              const remainder = totalBrands % 8;

              const numColumns = !totalBrands
                ? 8 // If no brands, default to 8 columns
                : remainder === 0
                  ? 8 // If remainder is 0, use 8 columns
                  : remainder <= 2
                    ? 6 // Remainder ≤ 2: 6 columns
                    : remainder <= 5
                      ? 7 // Remainder 3-5: 7 columns
                      : 8; // Otherwise: 8 columns
              const brandCollectionsRows = [];
              // Use filteredCollections instead of brandCollectionsEdges
              for (let i = 0; i < filteredCollections.length; i += numColumns) {
                brandCollectionsRows.push(filteredCollections.slice(i, i + numColumns));
              }

              return brandCollectionsRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-4 md:flex md:justify-center gap-6 md:gap-12 lg:gap-20 items-center"
                >
                  {row.map((brand) => (
                    <Link
                      key={brand.node.slug}
                      href={`/collections/${brand.node.slug}`}
                      className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block"
                    >
                      {brand.node.backgroundImage ? (
                        <Image
                          src={brand.node.backgroundImage.url}
                          alt={brand.node.name}
                          width={200}
                          height={200}
                          className="hover:brightness-125 hover:contrast-115 transition-all duration-30 max-w-[160px]"
                        />
                      ) : (
                        brand.node.name
                      )}
                    </Link>
                  ))}
                </div>
              ));
            })()}
        </div>
      </div>
    </>
  );
}

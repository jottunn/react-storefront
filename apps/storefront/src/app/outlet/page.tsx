import React from "react";
import { FilteredProductList } from "@/components/productList/FilteredProductList";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import {
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  LanguageCodeEnum,
} from "@/saleor/api";
import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/util";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
import PageHero from "@/components/PageHero";

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
  const collectionsIds = outletCollections && outletCollections.map((collect) => collect.id);
  const messages = getMessages(DEFAULT_LOCALE);

  return (
    <>
      {/*TODO <BaseSeo /> */}
      <header className="mb-4 pb-8 border-b border-main-6">
        <div className="bg-main-7 border-b mb-8">
          <div className="container flex gap-2 flex-wrap text-left py-4 px-8 ">
            <Link
              href="/"
              className="text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
            >
              Home
            </Link>{" "}
            <span className="text-gray-600 mt-2 text-base">/</span>
            <span className="text-sm mt-2 font-medium text-gray-400">
              {messages["app.search.outletTitle"]}
            </span>
          </div>
        </div>
        <div className="container px-8">
          <PageHero title={messages["app.search.outletTitle"]} description="" />
          {collectionsIds.length > 0 && (
            <div className="md:flex gap-4 justify-center mt-4">
              {outletCollections.map((collection, index) => (
                <div key={`sales-collection-${index}`} className="text-center my-4">
                  {collection.backgroundImage && collection.backgroundImage.url && (
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="underline"
                      aria-label={collection.name}
                    >
                      <Image
                        alt={collection.name}
                        className="transition-opacity duration-400 ease-in-out"
                        src={collection.backgroundImage.url}
                        width={300}
                        height={300}
                        style={{ objectFit: "contain" }}
                      />
                    </Link>
                  )}
                </div>
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

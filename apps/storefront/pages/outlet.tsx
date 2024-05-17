import { ApolloQueryResult } from "@apollo/client";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
} from "next";
import Custom404 from "pages/404";
import React, { ReactElement } from "react";
import clsx from "clsx";
import { Layout, PageHero } from "@/components";
import { FilteredProductList } from "@/components/productList/FilteredProductList";
import { contextToRegionQuery, localeToEnum } from "@/lib/regions";
import {
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  CollectionsByMetaKeyQueryVariables,
} from "@/saleor/api";
import { serverApolloClient } from "@/lib/ssr/common";
import { BaseSeo } from "@/components/seo/BaseSeo";
import Image from "next/image";
import { pagesPath } from "@/lib/$path";
import Link from "next/link";
import { useIntl } from "react-intl";
import { messages } from "@/components/translations";

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ channel: string; locale: string; slug: string }>,
) => {
  const response: ApolloQueryResult<CollectionsByMetaKeyQuery> = await serverApolloClient.query<
    CollectionsByMetaKeyQuery,
    CollectionsByMetaKeyQueryVariables
  >({
    query: CollectionsByMetaKeyDocument,
    variables: {
      filter: {
        metadata: [{ key: "isSale", value: "YES" }],
        published: "PUBLISHED",
      },
      ...contextToRegionQuery(context),
    },
    fetchPolicy: "no-cache",
  });

  return {
    props: {
      collections: response.data.collections?.edges.map((e: { node: any }) => e.node) || [],
    },
  };
};
function OutletPage({ collections }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const t = useIntl();
  if (!collections) {
    return <Custom404 />;
  }

  const collectionsIds = collections && collections.map((collect) => collect.id);

  return (
    <>
      <BaseSeo />
      <header className="mb-4 pt-4 pb-8 border-b border-main-6">
        <div className="container px-8">
          <PageHero title={t.formatMessage(messages.outletTitle)} description="" />
          {collectionsIds.length > 0 && (
            <div className="md:flex gap-4 justify-center mt-4">
              {collections.map((collection, index) => (
                <div key={`sales-collection-${index}`} className="text-center my-4">
                  {collection.backgroundImage && collection.backgroundImage.url && (
                    <Link
                      href={pagesPath.collections._slug(collection.slug).$url()}
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
          <FilteredProductList collectionIDs={collectionsIds} />
        ) : (
          <p className="text-md text-center">No sales at the moment</p>
        )}
      </div>
    </>
  );
}

export default OutletPage;

OutletPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

import { ApolloQueryResult, useQuery } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Custom404 from "pages/404";
import React, { ReactElement, useEffect, useRef, useState } from "react";

import { Layout, PageHero } from "@/components";
import { FilteredProductList } from "@/components/productList/FilteredProductList";
import { CollectionPageSeo } from "@/components/seo/CollectionPageSeo";
import { contextToRegionQuery, localeToEnum } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CollectionBySlugDocument,
  CollectionBySlugQuery,
  CollectionBySlugQueryVariables,
} from "@/saleor/api";
import { serverApolloClient } from "@/lib/ssr/common";
import { useRegions } from "@/components/RegionsProvider";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ channel: string; locale: string; slug: string }>
) => {
  if (!context.params) {
    return {
      props: {},
      notFound: true,
    };
  }

  const collectionSlug = context.params.slug.toString();
  const response: ApolloQueryResult<CollectionBySlugQuery> = await serverApolloClient.query<
    CollectionBySlugQuery,
    CollectionBySlugQueryVariables
  >({
    query: CollectionBySlugDocument,
    variables: {
      slug: collectionSlug,
      ...contextToRegionQuery(context),
    },
  });

  return {
    props: {
      collection: response.data.collection,
    },
  };
};
function CollectionPage({
  collection: initialCollection,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const skipQuery = useRef(true);
  const { currentChannel, currentLocale } = useRegions();
  const [collection, setCollection] = useState(initialCollection);

  const { refetch } = useQuery<CollectionBySlugQuery>(CollectionBySlugDocument, {
    variables: {
      slug: collection?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    },
    skip: skipQuery.current,
  });

  useEffect(() => {
    refetch({
      slug: collection?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    })
      .then((response) => {
        // Handle the successful refetch here
        if (response.data.collection) {
          setCollection(response.data.collection);
        }
      })
      .catch((error) => {
        console.error("Error during refetch collection:", error);
        // Handle the error here
      });
    // Ensure future updates don't skip the query
    skipQuery.current = false;
  }, [currentChannel.slug, currentLocale]);

  if (!collection) {
    return <Custom404 />;
  }

  return (
    <>
      <CollectionPageSeo collection={collection} />
      <header className="mb-4 pt-4 border-b border-main-6">
        <div className="container px-8">
          <PageHero
            title={translate(collection, "name")}
            description={translate(collection, "description") || ""}
          />
        </div>
      </header>
      <div className="container px-8 mt-4 mb-40">
        <FilteredProductList collectionIDs={[collection.id]} />
      </div>
    </>
  );
}

export default CollectionPage;

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

CollectionPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

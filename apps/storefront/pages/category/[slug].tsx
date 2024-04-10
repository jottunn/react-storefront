import { ApolloQueryResult, useQuery } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement, useEffect, useRef, useState } from "react";

import { Layout, PageHero } from "@/components";
import { FilteredProductList } from "@/components/productList/FilteredProductList/FilteredProductList";
import { CategoryPageSeo } from "@/components/seo/CategoryPageSeo";
import { mapEdgesToItems } from "@/lib/maps";
import { contextToRegionQuery, localeToEnum } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CategoryBySlugDocument,
  CategoryBySlugQuery,
  CategoryBySlugQueryVariables,
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

  const categorySlug = context.params.slug.toString();
  const response: ApolloQueryResult<CategoryBySlugQuery> = await serverApolloClient.query<
    CategoryBySlugQuery,
    CategoryBySlugQueryVariables
  >({
    query: CategoryBySlugDocument,
    variables: {
      slug: categorySlug,
      locale: contextToRegionQuery(context).locale,
    },
  });

  return {
    props: {
      category: response.data.category,
    },
  };
};

function CategoryPage({
  category: initialCategory,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const skipQuery = useRef(true);
  const { currentChannel, currentLocale } = useRegions();
  const [category, setCategory] = useState(initialCategory);

  const subcategories = mapEdgesToItems(category?.children);

  const navigateToCategory = (categorySlug: string) => {
    void router.push({
      pathname: categorySlug,
    });
  };

  const { refetch } = useQuery<CategoryBySlugQuery>(CategoryBySlugDocument, {
    variables: {
      slug: category?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    },
    skip: skipQuery.current,
  });

  useEffect(() => {
    refetch({
      slug: category?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    })
      .then((response) => {
        // Handle the successful refetch here
        if (response.data.category) {
          setCategory(response.data.category);
        }
      })
      .catch((error) => {
        console.error("Error during refetch:", error);
        // Handle the error here
      });
    // Ensure future updates don't skip the query
    skipQuery.current = false;
  }, [currentChannel.slug, currentLocale]);

  if (!category) {
    return <Custom404 />;
  }
  return (
    <>
      <CategoryPageSeo category={category} />
      <header className="mb-4 pt-4 border-b border-main-6">
        <div className="container px-8">
          <PageHero
            title={translate(category, "name")}
            description={translate(category, "description") || ""}
            pills={subcategories.map((subcategory) => ({
              label: translate(subcategory, "name"),
              onClick: () => navigateToCategory(subcategory.slug),
            }))}
          />
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-40">
          <FilteredProductList categoryIDs={[category.id]} />
        </div>
      </main>
    </>
  );
}

export default CategoryPage;

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

CategoryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

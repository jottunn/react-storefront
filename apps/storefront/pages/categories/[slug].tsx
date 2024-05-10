import { ApolloQueryResult, useQuery } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement, useCallback, useState } from "react";
import debounce from "lodash/debounce";
import { Layout, PageHero } from "@/components";
import { FilteredProductList } from "@/components/productList/FilteredProductList/FilteredProductList";
import { CategoryPageSeo } from "@/components/seo/CategoryPageSeo";
import { mapEdgesToItems } from "@/lib/maps";
import { contextToRegionQuery, localeToEnum } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  Category,
  CategoryBySlugDocument,
  CategoryBySlugQuery,
  CategoryBySlugQueryVariables,
} from "@/saleor/api";

import { useRegions } from "@/components/RegionsProvider";
import { serverApolloClient } from "@/lib/ssr/common";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ channel: string; locale: string; slug: string }>,
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
  const { currentChannel, currentLocale } = useRegions();
  const [category, setCategory] = useState(initialCategory);

  const parentCategories = mapEdgesToItems(category?.ancestors);
  const subcategories = mapEdgesToItems(category?.children);

  const navigateToCategory = (categorySlug: string) => {
    void router.push({
      pathname: categorySlug,
    });
  };
  const debouncedSetCategory = useCallback(
    debounce((newCategory: Category) => {
      setCategory(newCategory);
    }, 300),
    [],
  );

  const { refetch } = useQuery<CategoryBySlugQuery>(CategoryBySlugDocument, {
    variables: {
      slug: (router.query.slug as string) || initialCategory?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    },
    skip: !router.isReady || !router.query.slug,
    onCompleted: (data) => {
      // console.log('fetched, change state');
      if (data.category) {
        // setCategory(data.category);
        debouncedSetCategory(data.category as Category);
      }
    },
  });

  // console.log('render category');

  // useEffect(() => {
  //   console.log("Fetching or updating category:", router.query.slug);
  //   let isMounted = true;
  //   const fetchCategory = async () => {
  //     try {
  //       if (router.isReady) {
  //         const response = await refetch({
  //           slug: router.query.slug as string,
  //           locale: localeToEnum(currentLocale),
  //           channel: currentChannel.slug,
  //         });

  //         if (isMounted && response.data.category) {
  //           debouncedSetCategory(response.data.category as Category);
  //         }
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchCategory();

  //   return () => {
  //     isMounted = false;
  //     debouncedSetCategory.cancel();
  //   };
  // }, [router.isReady, router.query.slug, currentChannel.slug, currentLocale]);

  if (!category) {
    return <Custom404 />;
  }
  return (
    <>
      <CategoryPageSeo category={category} />
      <header className="mb-4 border-b border-main-6">
        <div className="container px-8 p-4">
          <PageHero
            title={translate(category, "name")}
            description={translate(category, "description") || ""}
            pills={subcategories.map((subcategory) => ({
              label: translate(subcategory, "name"),
              onClick: () => navigateToCategory(subcategory.slug),
            }))}
            parents={parentCategories.map((parentCategory) => ({
              label: translate(parentCategory, "name"),
              slug: parentCategory.slug,
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

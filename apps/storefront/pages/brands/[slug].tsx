import { ApolloQueryResult, useQuery } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Custom404 from "pages/404";
import React, { ReactElement, useEffect, useRef, useState } from "react";

import { Layout, RichText } from "@/components";
import { contextToRegionQuery, localeToEnum } from "@/lib/regions";

import { PageDocument, PageQuery } from "@/saleor/api";
import { serverApolloClient } from "@/lib/ssr/common";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { BaseSeo } from "@/components/seo/BaseSeo";
import Image from "next/image";
import { translate } from "@/lib/translations";
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
  const attributeSlug = context.params.slug.toString();
  const pageResponse: ApolloQueryResult<PageQuery> = await serverApolloClient.query<PageQuery>({
    query: PageDocument,
    variables: {
      slug: attributeSlug,
      locale: contextToRegionQuery(context).locale,
    },
  });

  const logoAttribute = pageResponse.data.page?.attributes.find(
    (attr) => attr.attribute.inputType === "FILE"
  );
  const logoImg = logoAttribute?.values[0]?.name;

  return {
    props: {
      brand: attributeSlug,
      logoImg: logoImg,
      pageInfo: pageResponse.data.page,
    },
  };
};

function BrandPage({
  brand,
  logoImg,
  pageInfo: initialPageInfo,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const skipQuery = useRef(true);
  const { currentChannel, currentLocale } = useRegions();
  const [pageInfo, setPageInfo] = useState(initialPageInfo);

  const { refetch } = useQuery<PageQuery>(PageDocument, {
    variables: {
      slug: brand,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    },
    skip: skipQuery.current,
  });

  useEffect(() => {
    refetch({
      slug: brand,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    })
      .then((response) => {
        // Handle the successful refetch here
        if (response.data.page) {
          setPageInfo(response.data.page);
        }
      })
      .catch((error) => {
        console.error("Error during refetch:", error);
        // Handle the error here
      });
    // Ensure future updates don't skip the query
    skipQuery.current = false;
  }, [currentChannel.slug, currentLocale]);

  if (!brand) {
    return <Custom404 />;
  }

  return (
    <>
      <BaseSeo title={brand.toUpperCase()} />
      <header className="mb-4 pt-4 border-b border-main-6">
        <div className="container px-8 text-center py-8">
          {brand && (
            <>
              <Image
                src={`${process.env.NEXT_PUBLIC_MEDIA_UPLOAD_PATH ?? ""}/${logoImg ?? ""}`}
                className="inline-block max-w-[200px] h-auto"
                alt={brand.toUpperCase()}
                width={100}
                height={100}
              />
              {pageInfo?.content && (
                <div className="text-lg inline-block sm:block my-6 text-main-1">
                  <RichText jsonStringData={translate(pageInfo, "content") || ""} />
                </div>
              )}
            </>
          )}
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-40">
          <FilteredProductList brand={brand} />
        </div>
      </main>
    </>
  );
}

export default BrandPage;

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

BrandPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

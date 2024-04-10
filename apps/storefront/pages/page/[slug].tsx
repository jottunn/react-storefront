import { ApolloQueryResult, useQuery } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Custom404 from "pages/404";
import { ReactElement, useEffect, useRef, useState } from "react";

import { Layout, RichText } from "@/components";
import { contextToRegionQuery, localeToEnum } from "@/lib/regions";
import { translate } from "@/lib/translations";
import { PageDocument, PageQuery, PageQueryVariables } from "@/saleor/api";
import { serverApolloClient } from "@/lib/ssr/common";
import { useRegions } from "@/components/RegionsProvider";

export interface pathParams {
  channel: string;
  locale: string;
  slug: string;
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps = async (
  context: GetStaticPropsContext<{ channel: string; locale: string; slug: string }>
) => {
  if (!context.params) {
    return {
      props: {},
      notFound: true,
    };
  }

  const pageSlug = context.params.slug.toString();
  const response: ApolloQueryResult<PageQuery> = await serverApolloClient.query<
    PageQuery,
    PageQueryVariables
  >({
    query: PageDocument,
    variables: {
      slug: pageSlug,
      locale: contextToRegionQuery(context).locale,
    },
  });
  return {
    props: {
      page: response.data.page,
    },
  };
};

function PagePage({ page: initialPage }: InferGetStaticPropsType<typeof getStaticProps>) {
  const skipQuery = useRef(true);
  const { currentChannel, currentLocale } = useRegions();
  const [page, setPage] = useState(initialPage);

  const { refetch } = useQuery<PageQuery>(PageDocument, {
    variables: {
      slug: page?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    },
    skip: skipQuery.current,
  });

  useEffect(() => {
    refetch({
      slug: page?.slug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    })
      .then((response) => {
        if (response.data.page) {
          setPage(response.data.page);
        }
      })
      .catch((error) => {
        console.error("Error during refetch collection:", error);
      });
    // Ensure future updates don't skip the query
    skipQuery.current = false;
  }, [currentChannel.slug, currentLocale]);

  const content = page && translate(page, "content");

  if (!page?.id) {
    return <Custom404 />;
  }

  return (
    <main className="container pt-8 px-8">{content && <RichText jsonStringData={content} />}</main>
  );
}

export default PagePage;

PagePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

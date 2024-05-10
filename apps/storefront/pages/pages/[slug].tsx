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
  context: GetStaticPropsContext<{ channel: string; locale: string; slug: string }>,
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
  const richTextAttributes =
    page && "attributes" in page
      ? page.attributes.filter((attr) => attr.attribute.inputType === "RICH_TEXT")
      : [];

  if (!page?.id) {
    return <Custom404 />;
  }

  return (
    <main className="container pt-8 px-8">
      {content && <RichText jsonStringData={content} />}
      {richTextAttributes && richTextAttributes.length > 0 && (
        <div className="container flex flex-col md:flex-row">
          {richTextAttributes.map((attr, index) =>
            attr.values.map((item) => {
              const parsedRichText = JSON.parse(item.richText as "string");
              if (parsedRichText && parsedRichText.blocks && parsedRichText.blocks.length > 0) {
                return (
                  <div key={`${index}`} className="md:w-1/2 p-4 border-t border-gray-300 py-20">
                    <div className="p-2">
                      <RichText jsonStringData={item.richText || undefined} />
                    </div>
                  </div>
                );
              }
            }),
          )}
        </div>
      )}
    </main>
  );
}

export default PagePage;

PagePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

import { notFound, redirect } from "next/navigation";
import { executeGraphQL } from "@/lib/graphql";
import {
  SearchProductsDocument,
  ProductOrderField,
  OrderDirection,
  SearchProductsQuery,
} from "@/saleor/api";
import { ProductsPerPage } from "../config";
import { ProductCollection } from "@/components/productList/ProductCollection";
import { DEFAULT_CHANNEL, DEFAULT_LOCALE } from "@/lib/regions";
import FilteredProductList from "@/components/productList/FilteredProductList";
import messages from "@/components/translations";
import { getMessages } from "@/lib/util";

export const metadata = {
  title: "Search products",
  description: "Search products Surmont",
};

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Record<"query" | "cursor", string | string[] | undefined>;
  params: { channel: string };
}) {
  const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;
  const searchValue = searchParams.query;
  const messages = getMessages(DEFAULT_LOCALE);
  if (!searchValue) {
    redirect("/");
  }

  if (Array.isArray(searchValue)) {
    const firstValidSearchValue = searchValue.find((v) => v.length > 0);
    if (!firstValidSearchValue) {
      redirect("/");
    }
    redirect(`/search?${new URLSearchParams({ query: firstValidSearchValue }).toString()}`);
  }

  const { products } = await executeGraphQL<
    SearchProductsQuery,
    { first: any; search: any; after: any; sortBy: any; sortDirection: any; channel: string }
  >(SearchProductsDocument, {
    variables: {
      first: ProductsPerPage,
      search: searchValue,
      after: cursor,
      sortBy: "RATING",
      sortDirection: "ASC",
      channel: DEFAULT_CHANNEL.slug,
    },
    revalidate: 60,
  });

  const productsIds = products?.edges.map((e: { node: { id: any } }) => e.node.id);

  const newSearchParams = new URLSearchParams({
    query: searchValue,
    ...(products?.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
  });

  return (
    <main>
      <div className="container px-8 mt-4 mb-40">
        {products?.totalCount && products.totalCount > 0 ? (
          <div>
            <h1 className="pt-6 pb-10 text-xl font-semibold">
              {messages["app.search.searchHeader"]} &quot;{searchValue}&quot;:
            </h1>

            {products && <FilteredProductList productsIDs={productsIds} messages={messages} />}
            {/* <Pagination
                            pageInfo={{
                                ...products.pageInfo,
                                basePathname: `/search`,
                                urlSearchParams: newSearchParams,
                            }}
                        /> */}
          </div>
        ) : (
          <h1 className="mx-auto pb-8 text-center text-xl font-semibold">Nothing found :(</h1>
        )}
      </div>
    </main>
  );
}

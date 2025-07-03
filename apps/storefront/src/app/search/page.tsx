import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import { processSearchParams } from "@/components/searchParams/SearchParamsProvider";
import { getProductCollectionData } from "../actions";
import PageHero from "@/components/PageHero";
import { algoliaClient } from "@/lib/searchClient";
import Products from "@/components/productList/products";
export const dynamic = "force-dynamic";

const messages = getMessages(DEFAULT_LOCALE);
export const metadata = {
  title: `${messages["app.search.searchTitle"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.search.searchTitle"]} - Surmont.ro`,
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/search` : undefined,
  },
};

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.query;
  const { sortBy, filters } = await processSearchParams(searchParams);
  let productsIDs: string[] | undefined = undefined;

  // Try Algolia search on the server if search is present and algoliaClient is available
  if (search && algoliaClient) {
    try {
      const index = algoliaClient.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "");
      const results = await index.search(search);
      if (results.hits && results.hits.length > 0) {
        productsIDs = results.hits.map((hit: any) => hit.productId).filter(Boolean);
      }
    } catch (err) {
      // Algolia search failed, fallback to GraphQL
      productsIDs = undefined;
    }
  }

  const displayedTitle = search ? (
    <>
      {messages["app.search.searchHeader"]} <span className="text-action-1">{search}</span>
    </>
  ) : (
    messages["app.search.searchHeader"]
  );

  // Get product collection data, using Algolia IDs if available
  const productCollection = await getProductCollectionData({
    filters,
    sortBy,
    messages,
    search,
    ...(productsIDs && productsIDs.length > 0 ? { productsIDs } : {}),
  });
  const productsProps = {
    productCollection,
    messages,
    ...(productsIDs && productsIDs.length > 0 ? { productsIDs } : { search }),
  };

  return (
    <>
      <header className="border-b border-main-6">
        <div className="container p-6">
          <PageHero title={displayedTitle} />
        </div>
      </header>
      {/* <SearchClient productCollection={productCollection} messages={messages} /> */}
      <main>
        <div className="container px-6 mt-4 mb-12 md:mb-40 min-h-[600px]">
          <Products {...productsProps} />
        </div>
      </main>
    </>
  );
}

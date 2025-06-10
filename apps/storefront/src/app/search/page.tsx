import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import SearchClient from "./SearchClient";
import { processSearchParams } from "@/components/searchParams/SearchParamsProvider";
import { getProductCollectionData } from "../actions";
import PageHero from "@/components/PageHero";
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
  const displayedTitle = search ? (
    <>
      {messages["app.search.searchHeader"]} <span className="text-action-1">{search}</span>
    </>
  ) : (
    messages["app.search.searchHeader"]
  );
  // Get product collection data
  const productCollection = await getProductCollectionData({
    filters,
    sortBy,
    messages,
    search,
  });

  return (
    <>
      <header className="border-b border-main-6">
        <div className="container p-6">
          <PageHero title={displayedTitle} />
        </div>
      </header>
      <SearchClient productCollection={productCollection} messages={messages} />
    </>
  );
}

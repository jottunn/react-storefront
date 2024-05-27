import { useQueryState } from "next-usequerystate";
import React, { ReactElement, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useDebounce } from "react-use";
import { Layout } from "@/components";
import { messages } from "@/components/translations";
import { ProductFilterInput } from "@/saleor/api";
import { algoliaClient } from "@/lib/searchClient";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { SearchIndex } from "algoliasearch";
import CustomSearchBox from "@/components/Search/searchBox";

interface Hit {
  objectID: string;
  name: string;
  [key: string]: any;
}
function SearchPage() {
  const t = useIntl();
  const [searchQuery, _setSearchQuery] = useQueryState("q");
  const [productsIds, setProductsIds] = useState<string[]>([]);
  const [displayedSearchQuery, setDisplayedSearchQuery] = React.useState("");
  const [debouncedFilter, setDebouncedFilter] = React.useState<ProductFilterInput>({});

  useDebounce(
    () => {
      if (searchQuery) {
        setDebouncedFilter({ search: searchQuery });
      } else {
        setDebouncedFilter({});
      }
    },
    1000,
    [searchQuery],
  );

  useEffect(() => {
    const fetchProductIds = async () => {
      if (searchQuery && searchQuery.length > 2 && algoliaClient) {
        try {
          const index: SearchIndex = algoliaClient.initIndex(
            process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "",
          );
          const results = await index.search<Hit>(searchQuery);
          const hits = results.hits;
          const ids = hits.map((hit) => hit.objectID);
          setProductsIds(ids);
        } catch (error) {
          console.error("Algolia search error: ", error);
          // Fallback logic here
        }
      }
    };

    if (searchQuery !== null) {
      setDisplayedSearchQuery(searchQuery);
      fetchProductIds();
    }
  }, [searchQuery]);

  return (
    <main className="container w-full px-8 mt-5 py-8">
      {searchQuery !== null && (
        <>
          <p className="font-semibold text-xl mb-5">
            {t.formatMessage(messages.searchHeader)} &nbsp;
            {displayedSearchQuery && <span className="text-action-1">{displayedSearchQuery}</span>}
          </p>
          {Object.keys(debouncedFilter).length > 0 &&
            (productsIds.length > 0 ? (
              <FilteredProductList productsIDs={productsIds} />
            ) : (
              <FilteredProductList search={debouncedFilter} />
            ))}
        </>
      )}
      {searchQuery === null && <CustomSearchBox />}
    </main>
  );
}

SearchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default SearchPage;

import { useQueryState } from "next-usequerystate";
import React, { ReactElement, useEffect } from "react";
import { useIntl } from "react-intl";
import { useDebounce } from "react-use";

import { Layout, ProductCollection } from "@/components";
import { messages } from "@/components/translations";
import { ProductFilterInput } from "@/saleor/api";

function SearchPage() {
  const t = useIntl();
  const [searchQuery, _setSearchQuery] = useQueryState("q");
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
    [searchQuery]
  );

  useEffect(() => {
    if (searchQuery !== null) {
      setDisplayedSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  return (
    <main className="container w-full px-8 mt-5 py-8">
      <p className="font-semibold text-xl mb-5">
        {t.formatMessage(messages.searchHeader)} &nbsp;
        {displayedSearchQuery && <span className="text-action-1">{displayedSearchQuery}</span>}
      </p>
      {searchQuery !== null && Object.keys(debouncedFilter).length > 0 && (
        <ProductCollection filter={debouncedFilter} />
      )}
    </main>
  );
}

SearchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default SearchPage;

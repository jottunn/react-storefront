"use client";

import React, { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { useSearchParams } from "next/navigation";
import { ProductFilterInput } from "@/saleor/api";
import { algoliaClient } from "@/lib/searchClient";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { SearchIndex } from "algoliasearch";
import { Messages } from "@/lib/util";
import CustomSearchBox from "@/components/nav/SearchBox";

interface Hit {
    objectID: string;
    name: string;
    [key: string]: any;
}

interface SearchClientProps {
    messages: Messages;
}

const SearchClient = ({ messages }: SearchClientProps) => {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("query");
    const [productsIds, setProductsIds] = useState<string[]>([]);
    const [displayedSearchQuery, setDisplayedSearchQuery] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState<ProductFilterInput>({});

    useDebounce(
        () => {
            if (searchQuery) {
                setDebouncedFilter({ search: searchQuery });
            } else {
                setDebouncedFilter({});
            }
        },
        1500,
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
        <>
            {searchQuery !== null ? (
                <>
                    <p className="font-semibold text-xl mb-5">
                        {messages["app.search.searchHeader"]} &nbsp;
                        {displayedSearchQuery && <span className="text-action-1">{displayedSearchQuery}</span>}
                    </p>
                    {Object.keys(debouncedFilter).length > 0 &&
                        (productsIds.length > 0 ? (
                            <FilteredProductList productsIDs={productsIds} messages={messages} />
                        ) : (
                            <FilteredProductList search={debouncedFilter} messages={messages} />
                        ))}
                </>
            ) : (
                <CustomSearchBox />
            )}
        </>
    );
};

export default SearchClient;

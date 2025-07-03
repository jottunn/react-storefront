"use client";

import React, { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { useQueryState } from "nuqs";
import { ProductFilterInput } from "@/saleor/api";
import { algoliaClient } from "@/lib/searchClient";
import { SearchIndex } from "algoliasearch";
import { Messages } from "@/lib/util";
import dynamic from "next/dynamic";
import { getProductCollectionData } from "../actions";

const CustomSearchBox = dynamic(() => import("@/components/nav/components/Search/SearchBox"), {
  ssr: false,
});
const Products = dynamic(() => import("@/components/productList/products"), { ssr: false });

interface Hit {
  objectID: string;
  name: string;
  [key: string]: any;
}

interface SearchClientProps {
  productCollection: any;
  messages: Messages;
}

const SearchClient = ({
  productCollection: productCollectionInitial,
  messages,
}: SearchClientProps) => {
  const [productsIds, setProductsIds] = useState<string[]>([]);
  const [productCollection, setProductCollection] = useState(productCollectionInitial);
  const [debouncedFilter, setDebouncedFilter] = useState<ProductFilterInput>({});
  const [searchQuery, setSearchQuery] = useQueryState("query", { shallow: false });

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
          //console.log('hits', hits);
          const ids = hits.map((hit) => hit.productId);
          const newProductCollection = await getProductCollectionData({
            filters: [],
            ...(ids?.length && { productsIDs: ids }),
            sortBy: "",
            messages,
          });
          if (newProductCollection?.products?.length && newProductCollection.products.length > 0) {
            setProductCollection(newProductCollection);
            setProductsIds(ids);
          }
        } catch (error) {
          console.error("Algolia search error: ", error);
          // Fallback logic here
        }
      }
    };

    if (searchQuery !== null) {
      fetchProductIds();
    } else {
      setProductsIds([]);
      setDebouncedFilter({});
    }
  }, [searchQuery]);

  useEffect(() => {
    if (JSON.stringify(productCollection) !== JSON.stringify(productCollectionInitial)) {
      setProductCollection(productCollectionInitial);
    }
  }, [productCollectionInitial]);

  return (
    <>
      {searchQuery !== "" ? (
        <>
          <main>
            <div className="container px-8 mt-4 mb-12 md:mb-40 min-h-[600px]">
              {Object.keys(debouncedFilter).length > 0 &&
                (productsIds.length > 0 ? (
                  <Products
                    productCollection={productCollection}
                    productsIDs={productsIds}
                    messages={messages}
                  />
                ) : (
                  <Products
                    productCollection={productCollection}
                    search={debouncedFilter.search || ""}
                    messages={messages}
                  />
                ))}
            </div>
          </main>
        </>
      ) : (
        <main>
          <div className="container px-8 mt-4 mb-40">
            <CustomSearchBox
              expanded={true}
              onSearch={(value: string | null) => setSearchQuery(value)}
            />
          </div>
        </main>
      )}
    </>
  );
};

export default SearchClient;

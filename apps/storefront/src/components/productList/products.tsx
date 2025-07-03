"use client";
import { useQueryState } from "nuqs";
import { useState, useTransition, useEffect, useRef } from "react";
import {
  UrlFilter,
  parseQueryAttributeFilters,
  serializeQueryAttributeFilters,
} from "./attributes";
import Spinner from "../Spinner";
import {
  OrderDirection,
  ProductFilterInput,
  ProductOrderField,
  ProductVariant,
} from "@/saleor/api";
import { GroupedProduct } from "@/lib/product";
import { ProductCard } from "./ProductCard";

import FilterIconLabel from "./FilterIconLabel";
import SortingDropdown from "./SortingDropdown";
import { parseQuerySort, serializeQuerySort, UrlSorting } from "./sorting";
import { Pagination } from "./Pagination";
import { getProductCollectionData } from "src/app/actions";
import dynamic from "next/dynamic";
import { Messages } from "@/lib/util";
import ProductFilters from "./ProductFilters";

const MobileFilters = dynamic(() => import("./MobileFilters"), {
  ssr: false,
  loading: () => null,
});
// Create a global cache for products
const productCache = new Map<
  string,
  {
    products: GroupedProduct[];
    pageInfo: any;
    loadedPages: number;
    scrollPosition: number;
  }
>();

export interface ProductsProps {
  productCollection?: any;
  collectionIDs?: string[];
  categoryIDs?: string[];
  categorySlug?: string;
  productsIDs?: string[];
  sort?: UrlSorting;
  search?: string;
  messages: Messages;
}

export default function Products({
  productCollection,
  messages,
  categoryIDs,
  categorySlug,
  collectionIDs,
  productsIDs,
  search,
  sort,
}: ProductsProps) {
  const [isLoading, startTransition] = useTransition();
  const [queryFilters, setQueryFilters] = useQueryState("filters", {
    parse: parseQueryAttributeFilters,
    serialize: serializeQueryAttributeFilters,
    defaultValue: [],
    shallow: false,
    startTransition,
  });

  const [products, setProducts] = useState<GroupedProduct[]>(productCollection?.products || []);
  const [pageInfo, setPageInfo] = useState(productCollection?.pageInfo);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState(1);

  const productsListRef = useRef<HTMLDivElement>(null);
  const lastScrollPosition = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const hasInitialized = useRef(false);
  const PRODUCT_CACHE_CAPACITY = 2;
  // Generate cache key based on current filters and sort
  const getCacheKey = () => {
    return JSON.stringify({
      filters: queryFilters,
      sort,
      categoryIDs,
      collectionIDs,
    });
  };

  // Initialize from cache on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    const cacheKey = getCacheKey();
    const cached = productCache.get(cacheKey);
    if (cached) {
      setProducts(cached.products);
      setPageInfo(cached.pageInfo);
      setLoadedPages(cached.loadedPages);
      // Restore scroll position after a small delay to allow rendering
      setTimeout(() => {
        window.scrollTo(0, cached.scrollPosition);
      }, 50);
    }
    hasInitialized.current = true;
  }, []);

  useEffect(() => {
    if (
      productCollection &&
      JSON.stringify(productCollection.products) !== JSON.stringify(products)
    ) {
      // Update products and pageInfo with new data
      setProducts(productCollection.products);
      setPageInfo(productCollection.pageInfo);
      setLoadedPages(1);

      // Update cache with new data
      const cacheKey = getCacheKey();
      productCache.set(cacheKey, {
        products: productCollection.products,
        pageInfo: productCollection.pageInfo,
        loadedPages: 1,
        scrollPosition: lastScrollPosition.current,
      });
    }
  }, [productCollection]);

  // Save to cache only when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      const cacheKey = getCacheKey();
      if (productCache.size > PRODUCT_CACHE_CAPACITY) {
        const key = productCache.keys().next().value;
        if (key) productCache.delete(key);
      }
      productCache.set(cacheKey, {
        products,
        pageInfo,
        loadedPages,
        scrollPosition: lastScrollPosition.current,
      });

      // console.log(''set productCache - handleBeforeUnload cacheKey', cacheKey);
      // console.log('productCache', productCache);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also save cache when component unmounts
      handleBeforeUnload();
    };
  }, [loadedPages]);

  // Handle scroll position
  useEffect(() => {
    const handleScroll = () => {
      lastScrollPosition.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onLoadMore = async () => {
    if (!pageInfo?.hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const newProductCollection = await getProductCollectionData({
        filters: queryFilters,
        ...(categoryIDs?.length && { categoryIDs: categoryIDs }),
        ...(collectionIDs?.length && { collectionIDs: collectionIDs }),
        ...(productsIDs?.length && { productsIDs: productsIDs }),
        ...(search && { search: search }),
        sortBy: sort ? serializeQuerySort(sort) : serializeQuerySort(sortBy),
        after: pageInfo.endCursor,
        messages,
      });

      setProducts((prev) => [...prev, ...(newProductCollection.products as GroupedProduct[])]);
      setPageInfo(newProductCollection.pageInfo);
      setLoadedPages((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const openModal = () => setFilterModalOpen(true);
  const closeModal = () => setFilterModalOpen(false);

  const addAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
    // Check if this filter value is already applied
    const existingFilter = queryFilters.find((filter) => filter.slug === attributeSlug);
    const isValueAlreadyApplied = existingFilter?.values.includes(choiceSlug);

    if (isValueAlreadyApplied) {
      // Remove the value from the filter if it exists
      const newFilters = queryFilters.reduce<UrlFilter[]>((result, filter) => {
        if (filter.slug !== attributeSlug) {
          return [...result, filter];
        }

        const newFilterValues = filter.values.filter((value) => value !== choiceSlug);
        if (newFilterValues.length) {
          return [...result, { ...filter, values: newFilterValues }];
        }
        return result;
      }, []);

      return setQueryFilters(newFilters.length ? newFilters : null, {
        scroll: false,
        shallow: false,
        startTransition,
      });
    }

    // If attribute was not used before, add it
    if (!existingFilter) {
      return setQueryFilters([...queryFilters, { slug: attributeSlug, values: [choiceSlug] }], {
        scroll: false,
        shallow: false,
        startTransition,
      });
    }

    // If it's already here, add the new value
    const updatedFilters = queryFilters.map((filter) => {
      if (filter.slug === attributeSlug) {
        return {
          ...filter,
          values: [...filter.values, choiceSlug],
        };
      }
      return filter;
    });

    return setQueryFilters(updatedFilters, {
      scroll: false,
      shallow: false,
      startTransition,
    });
  };

  const clearFilters = async () => {
    await setQueryFilters(null, {
      scroll: false,
      shallow: false,
      startTransition,
    });
  };

  const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {
    shallow: false,
    startTransition,
  });

  const setSortBy = (value: UrlSorting | undefined | null) =>
    setSortByQuery(serializeQuerySort(value), {
      scroll: false,
      shallow: false,
      startTransition,
    });
  let sortBy = parseQuerySort(sortByQuery);
  if (!sortBy && sort !== undefined) {
    sortBy = sort;
  }
  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap md:items-center w-full mb-4 md:mb-8 scroll-margin-top md:h-[47px]">
        <div className="inline md:flex md:flex-none md:w-[250px] justify-between md:mb-0 mr-8 order-1">
          <div className="hidden md:flex flex-grow align-center md:align-start items-center">
            <FilterIconLabel messages={messages} />
          </div>
          <button
            aria-label="Open filters"
            onClick={openModal}
            type="button"
            className="flex block md:hidden border border-gray-300 py-2 px-4"
          >
            <FilterIconLabel messages={messages} />
          </button>
          {queryFilters.length > 0 && (
            <button
              onClick={() => clearFilters()}
              className="md:border md:border-main-1 py-2 md:p-2 md:bg-black text-main underline md:no-underline md:text-white hover:text-main-1 hover:bg-white text-[1.4rem] relative transform -translate-y-[4px] mt-2"
              type="button"
              data-testid="clearFilters"
            >
              {messages["app.clearAll"]}
            </button>
          )}
        </div>
        <div className="ml-auto md:ml-4 flex-none order-2 md:order-2 relative inline-block text-left float-right md:float-none">
          <SortingDropdown
            optionToggle={(field?: ProductOrderField, direction?: OrderDirection) => {
              return setSortBy(field && direction ? { field, direction } : null);
            }}
            chosen={sortBy}
            messages={messages}
          />
        </div>
      </div>
      <div className="block md:grid md:grid-cols-listing md:gap-8">
        {isMobile ? (
          <MobileFilters
            optionToggle={addAttributeFilter}
            categoryIDs={categoryIDs}
            categorySlug={categorySlug}
            collectionIDs={collectionIDs}
            productsIDs={productsIDs}
            search={search}
            closeModal={closeModal}
            messages={messages}
            show={filterModalOpen}
          />
        ) : (
          <div className="hidden md:block">
            <ProductFilters
              optionToggle={addAttributeFilter}
              categoryIDs={categoryIDs}
              categorySlug={categorySlug}
              collectionIDs={collectionIDs}
              productsIDs={productsIDs}
              search={search}
            />
          </div>
        )}
        <div>
          <div
            ref={productsListRef}
            className="grid grid-cols-2 md:grid-cols-3 gap-8 md:ml-6 mb-6"
            data-testid="productsList"
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {products && products.length > 0 ? (
                  products.map((product: any, index: number) => (
                    <ProductCard
                      key={`${product.id}-${product.colorGroup || ""}-${product.variants?.[0]?.id || index}`}
                      compliantVariant={product?.variants?.[0] as ProductVariant}
                      product={product as GroupedProduct}
                      priority={index < 9}
                      loading={index < 9 ? "eager" : "lazy"}
                      messages={messages}
                    />
                  ))
                ) : (
                  <p className="text-md">{messages["app.ui.noProductsInfo"]}</p>
                )}
              </>
            )}
          </div>

          {pageInfo && pageInfo.hasNextPage && !isLoading && (
            <div className="mt-4">
              {isLoadingMore ? (
                <div className="flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <Pagination onLoadMore={onLoadMore} messages={messages} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

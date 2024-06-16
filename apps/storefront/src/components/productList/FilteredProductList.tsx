"use client";
import { useQueryState } from "next-usequerystate";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  OrderDirection,
  ProductCountableEdge,
  ProductFilterInput,
  ProductOrderField,
  ProductVariant,
  SelectedAttribute,
} from "@/saleor/api";
import { ATTR_BRAND_REF, ATTR_COLOR_COMMERCIAL_SLUG, ATTR_GHID_MARIMI } from "@/lib/const";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

import { Messages } from "@/lib/util";
import { UrlSorting, parseQuerySort, serializeQuerySort } from "./sorting";
import {
  Attribute1,
  UrlFilter,
  getPillsData,
  parseQueryAttributeFilters,
  serializeQueryAttributeFilters,
} from "./attributes";
import FilterPills, { FilterPill } from "./FilterPills";
import useDebouncedValue from "@/lib/hooks/useDebouncedValue";
import FilterIconLabel from "./FilterIconLabel";
import SortingDropdown from "./SortingDropdown";
import FilterDropdowns from "./FilterDropdowns";
import { getAvailableFilters } from "src/app/actions";
import ProductCollection from "./ProductCollection";

export interface FilteredProductListProps {
  brand?: string;
  collectionIDs?: string[];
  categoryIDs?: string[];
  productsIDs?: string[];
  sort?: UrlSorting;
  search?: ProductFilterInput;
  messages: Messages;
}

export interface Filters {
  sortBy: string;
  attributes: Record<string, Array<string>>;
}

export function FilteredProductList({
  brand,
  collectionIDs,
  categoryIDs,
  productsIDs,
  sort,
  search,
  messages,
}: FilteredProductListProps) {
  const [queryFilters, setQueryFilters] = useQueryState("filters", {
    parse: parseQueryAttributeFilters,
    serialize: serializeQueryAttributeFilters,
    defaultValue: [],
  });

  // const [itemsCounter, setItemsCounter] = useState(0);
  const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {});
  let sortBy = parseQuerySort(sortByQuery);
  if (!sortBy && sort !== undefined) {
    sortBy = sort;
  }
  const setSortBy = (value: UrlSorting | undefined | null) =>
    setSortByQuery(serializeQuerySort(value));

  // const [inStockFilter, setInStockFilter] = useQueryState(
  //   "inStock",
  //   queryTypes.boolean.withDefault(false)
  // );
  // New state for managing attribute filters
  const [attributeFilters, setAttributeFilters] = useState<Attribute1[]>([]);
  const [productsFilter, setProductsFilter] = useState<ProductFilterInput>();
  const pills: FilterPill[] = getPillsData(queryFilters, attributeFilters);

  // console.log('render filtered list', categoryIDs);
  const debouncedProductsFilter = useDebouncedValue(productsFilter, 50);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const openModal = () => setFilterModalOpen(true);
  const closeModal = () => setFilterModalOpen(false);
  const aggregateAttributesFromProducts = (products: ProductCountableEdge[]) => {
    const attributesMap = new Map<string, Attribute1>();
    products?.forEach((product) => {
      // Aggregate attributes from the product
      product.node.attributes.forEach((attribute: SelectedAttribute) => {
        if (
          attribute.attribute.slug !== ATTR_GHID_MARIMI &&
          attribute.attribute.slug !== ATTR_BRAND_REF &&
          attribute.attribute.slug !== "recommended"
        ) {
          addAttributeToMap(attributesMap, attribute);
        }
      });

      // Aggregate attributes from each variant of the product with quantity available check
      product.node?.variants?.forEach((variant: ProductVariant) => {
        // console.log(doesVariantComplyWithFilter(variant));
        if (variant.quantityAvailable && variant.quantityAvailable > 0) {
          variant.attributes.forEach((attribute: SelectedAttribute) => {
            if (attribute.attribute.slug !== ATTR_COLOR_COMMERCIAL_SLUG) {
              addAttributeToMap(attributesMap, attribute);
            }
          });
        }
      });
    });

    // Convert Map values to array and map each attribute to include values as an array
    return Array.from(attributesMap.values()).map((attr) => ({
      ...attr,
      values: Array.from(attr.values),
    }));
  };

  const addAttributeToMap = (
    attributesMap: Map<string, Attribute1>,
    attribute: SelectedAttribute,
  ) => {
    // console.log('attributesMap', attributesMap);
    // console.log('attribute', attribute);
    if (!attributesMap.has(attribute.attribute.id)) {
      attributesMap.set(attribute.attribute.id, {
        id: attribute.attribute.id,
        slug: attribute.attribute.slug ?? "",
        name: attribute.attribute.name ?? "",
        inputType: attribute.attribute.inputType ?? "DROPDOWN",
        values: [],
      });
    }
    const attr = attributesMap.get(attribute.attribute.id);
    if (attr) {
      attribute.values.forEach((value) => {
        // Check if value is already in the array to mimic the behavior of a Set
        if (!attr.values.find((v) => v.id === value.id)) {
          // console.log('value', value);
          attr.values.push(value);
        }
      });
    }
  };

  const fetchAvailableFilters = useCallback(async () => {
    try {
      const products = await getAvailableFilters(productsFilter as ProductFilterInput);
      if (products) {
        const avFilter = aggregateAttributesFromProducts(products.edges as ProductCountableEdge[]);
        setAttributeFilters(avFilter);
      }
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    }
  }, [productsFilter]);

  useEffect(() => {
    if (debouncedProductsFilter !== undefined) {
      fetchAvailableFilters();
    }
  }, [debouncedProductsFilter, fetchAvailableFilters]);

  useEffect(() => {
    const attrS = queryFilters.filter((filter) => filter.values?.length);
    if (brand) {
      attrS.push({
        slug: "brand",
        values: [brand],
      });
    }

    const newProductsFilter: ProductFilterInput = {
      attributes: attrS, //queryFilters.filter((filter) => filter.values?.length),
      ...(categoryIDs?.length && { categories: categoryIDs }),
      ...(collectionIDs?.length && { collections: collectionIDs }),
      stockAvailability: "IN_STOCK",
      isPublished: true,
      isVisibleInListing: true,
      ...(productsIDs?.length && { ids: productsIDs }),
      ...search,
    };

    // Only update productsFilter state if it's different from the current state
    if (JSON.stringify(newProductsFilter) !== JSON.stringify(productsFilter)) {
      setProductsFilter(newProductsFilter);
    }

    // Eslint does not recognize stringified queryFilters, so we have to ignore it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryFilters), categoryIDs, collectionIDs, brand, productsIDs, search]);

  const removeAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
    const newFilters = queryFilters.reduce((result: UrlFilter[], filter: UrlFilter) => {
      if (filter.slug !== attributeSlug) {
        return [...result, filter];
      }
      const newFilterValues = filter.values.filter((value) => value !== choiceSlug);
      if (newFilterValues?.length) {
        return [...result, { ...filter, values: newFilterValues }];
      }
      return result;
    }, []);

    return setQueryFilters(newFilters.length ? newFilters : null);
  };

  const addAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
    const isFilterAlreadyApplied = !!pills.find(
      (pill) => pill.attributeSlug === attributeSlug && pill.choiceSlug === choiceSlug,
    );
    if (isFilterAlreadyApplied) {
      return removeAttributeFilter(attributeSlug, choiceSlug);
    }

    // if attribute was not used before, add it
    const existingFilter = queryFilters.find((filter) => filter.slug === attributeSlug);
    if (!existingFilter) {
      return setQueryFilters([...queryFilters, { slug: attributeSlug, values: [choiceSlug] }], {
        scroll: false,
        shallow: true,
      });
    }

    // if its already here, modify values list
    existingFilter.values = [...existingFilter.values, choiceSlug];
    return setQueryFilters(queryFilters, {
      scroll: false,
      shallow: true,
    });
  };

  const clearFilters = async () => {
    // await required when multiple query changes are applied at once
    await setQueryFilters(null, {
      scroll: false,
      shallow: true,
    });
    // await setInStockFilter(null, {
    //   scroll: false,
    //   shallow: true,
    // });
  };

  if (!productsFilter) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap items-center justify-start w-full mb-8">
        <div className="inline md:flex md:flex-none md:w-[250px] justify-between mb-8 md:mb-0 mr-8 order-1">
          <div className="hidden md:flex flex-grow align-center md:align-start ">
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
        </div>
        <div className="ml-auto flex-none order-2 md:order-3 relative inline-block text-left float-right">
          <SortingDropdown
            optionToggle={(field?: ProductOrderField, direction?: OrderDirection) => {
              return setSortBy(field && direction ? { field, direction } : null);
            }}
            chosen={sortBy}
            messages={messages}
          />
        </div>

        {pills.length > 0 && (
          <FilterPills
            pills={pills}
            onClearFilters={clearFilters}
            onRemoveAttribute={removeAttributeFilter}
            messages={messages}
          />
        )}
      </div>

      <div className="block md:grid md:grid-cols-listing md:gap-8">
        <div className="hidden md:block">
          <FilterDropdowns
            attributeFilters={attributeFilters}
            addAttributeFilter={addAttributeFilter}
            pills={pills}
          />
        </div>
        <Transition show={filterModalOpen}>
          <Dialog onClose={closeModal} className="relative z-50">
            <TransitionChild
              as={Fragment}
              enter="transition-all ease-in-out duration-300"
              enterFrom="opacity-0 backdrop-blur-none"
              enterTo="opacity-100 backdrop-blur-[.5px]"
              leave="transition-all ease-in-out duration-200"
              leaveFrom="opacity-100 backdrop-blur-[.5px]"
              leaveTo="opacity-0 backdrop-blur-none"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            </TransitionChild>
            <TransitionChild
              as={Fragment}
              enter="transition-all ease-in-out duration-300"
              enterFrom="translate-x-[-100%]"
              enterTo="translate-x-0"
              leave="transition-all ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-[-100%]"
            >
              <DialogPanel className="fixed bottom-0 left-0 top-0 flex h-full w-[310px] flex-col border-l border-neutral-200 bg-white/90 p-6 text-black backdrop-blur-xl md:w-[430px]">
                <div className="flex justify-between justify-start w-full items-center mb-6">
                  <span className="text-md font-bold">FILTERS</span>
                  <button title="Close" aria-label="Close cart" onClick={closeModal} type="button">
                    <div className="relative flex h-11 w-11 items-center justify-center text-black transition-colors dark:border-neutral-700 dark:text-dark">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="h-6 transition-all ease-in-out hover:scale-110 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </div>
                <FilterDropdowns
                  attributeFilters={attributeFilters}
                  addAttributeFilter={addAttributeFilter}
                  pills={pills}
                />
                <button
                  title="Apply"
                  aria-label="Apply filters"
                  onClick={closeModal}
                  type="button"
                  className="bg-black p-3 mt-4 text-white text-md w-2/5"
                >
                  {messages["app.buttons.apply"]}
                </button>
              </DialogPanel>
            </TransitionChild>
          </Dialog>
        </Transition>
        <div>
          <ProductCollection
            filter={productsFilter}
            sortBy={sortBy || undefined}
            // setCounter={setItemsCounter}
            perPage={30}
            messages={messages}
          />
        </div>
      </div>
    </>
  );
}

export default FilteredProductList;

import { TransitionOptions, useQueryState } from "next-usequerystate";
import { useEffect, useState } from "react";
import { ProductCollection } from "@/components/ProductCollection";
import {
  AvailableProductFiltersDocument,
  OrderDirection,
  ProductCountableEdge,
  ProductFilterInput,
  ProductOrderField,
  ProductVariant,
  SelectedAttribute,
} from "@/saleor/api";

import {
  Attribute1,
  getFilterOptions,
  getPillsData,
  parseQueryAttributeFilters,
  serializeQueryAttributeFilters,
  UrlFilter,
} from "./attributes";
import { FilterPill, FilterPills } from "./FilterPills";
import { parseQuerySort, serializeQuerySort, UrlSorting } from "./sorting";
import { SortingDropdown } from "./SortingDropdown";
import useDebouncedValue from "@/lib/hooks/useDebouncedValue";
import { useApolloClient } from "@apollo/client";
import { useRegions } from "@/components/RegionsProvider";
import FilterDropdown from "./FilterDropdown";
import { ATTR_BRAND_REF, ATTR_COLOR_COMMERCIAL_SLUG, ATTR_GHID_MARIMI } from "@/lib/const";

export interface FilteredProductListProps {
  brand?: string;
  collectionIDs?: string[];
  categoryIDs?: string[];
}

export interface Filters {
  sortBy: string;
  attributes: Record<string, Array<string>>;
}

export function FilteredProductList({
  brand,
  collectionIDs,
  categoryIDs,
}: FilteredProductListProps) {
  const [queryFilters, setQueryFilters] = useQueryState("filters", {
    parse: parseQueryAttributeFilters,
    serialize: serializeQueryAttributeFilters,
    defaultValue: [],
  });

  // const [itemsCounter, setItemsCounter] = useState(0);
  const [sortByQuery, setSortByQuery] = useQueryState("sortBy", {});
  const sortBy = parseQuerySort(sortByQuery);
  const setSortBy = (
    value: UrlSorting | undefined | null,
    transitionOptions?: TransitionOptions | undefined
  ) => setSortByQuery(serializeQuerySort(value), transitionOptions);

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
  const apolloClient = useApolloClient();
  const { query } = useRegions();

  const aggregateAttributesFromProducts = (products: ProductCountableEdge[]) => {
    const attributesMap = new Map<string, Attribute1>();
    products?.forEach((product) => {
      // Aggregate attributes from the product
      product.node.attributes.forEach((attribute: SelectedAttribute) => {
        if (
          attribute.attribute.slug !== ATTR_GHID_MARIMI &&
          attribute.attribute.slug !== ATTR_BRAND_REF
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
    attribute: SelectedAttribute
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

  const fetchAvailableFilters = async () => {
    console.log("trigger refetch");
    console.log(productsFilter);
    try {
      const { data: avFiltersData } = await apolloClient.query({
        query: AvailableProductFiltersDocument,
        variables: {
          filter: productsFilter,
          ...query,
        },
        fetchPolicy: "network-only",
      });
      if (avFiltersData) {
        //workaround for saleor bug, sgraphql query "attributes" does not implement distinct, attributes can be on multiple product types

        const avFilter = aggregateAttributesFromProducts(
          avFiltersData?.products?.edges as ProductCountableEdge[]
        );
        setAttributeFilters(avFilter);
      }
    } catch (err) {
      // Handle error
    }
  };

  useEffect(() => {
    // console.log('debouncedProductsFilter', debouncedProductsFilter);
    if (debouncedProductsFilter !== undefined) {
      fetchAvailableFilters().catch((error) => {
        console.error("Failed to fetch filters:", error);
        // Handle the error appropriately
      });
    }
  }, [debouncedProductsFilter]);

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
    };

    // Only update productsFilter state if it's different from the current state
    if (JSON.stringify(newProductsFilter) !== JSON.stringify(productsFilter)) {
      setProductsFilter(newProductsFilter);
    }

    // Eslint does not recognize stringified queryFilters, so we have to ignore it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryFilters), categoryIDs, collectionIDs, brand]);

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

    return setQueryFilters(newFilters.length ? newFilters : null, {
      scroll: false,
      shallow: true,
    });
  };

  const addAttributeFilter = (attributeSlug: string, choiceSlug: string) => {
    const isFilterAlreadyApplied = !!pills.find(
      (pill) => pill.attributeSlug === attributeSlug && pill.choiceSlug === choiceSlug
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
      <div className="flex flex-col divide-y">
        <div className="flex items-center">
          <div className="flex-grow">
            {attributeFilters &&
              attributeFilters.map((attribute) => (
                <FilterDropdown
                  key={attribute.id}
                  label={attribute.name ?? ""}
                  //TODO label={translate(attribute.attribute, "name") || ""}
                  optionToggle={addAttributeFilter}
                  attributeSlug={attribute.slug}
                  options={getFilterOptions(attribute, pills)}
                />
              ))}
            <SortingDropdown
              optionToggle={(field?: ProductOrderField, direction?: OrderDirection) => {
                return setSortBy(field && direction ? { field, direction } : null, {
                  scroll: false,
                  shallow: true,
                });
              }}
              chosen={sortBy}
            />
            {/* <StockToggle
              enabled={inStockFilter}
              onChange={(value: boolean) =>
                setInStockFilter(!!value || null, {
                  scroll: false,
                  shallow: true,
                })
              }
            /> */}
          </div>
          {/* <div className="flex-none text-main-2 text-base">
            <div>{itemsCounter} items</div>
          </div> */}
        </div>
        {pills.length > 0 && (
          <FilterPills
            pills={pills}
            onClearFilters={clearFilters}
            onRemoveAttribute={removeAttributeFilter}
          />
        )}
      </div>

      <div className="mt-4">
        <ProductCollection
          filter={productsFilter}
          sortBy={sortBy || undefined}
          // setCounter={setItemsCounter}
          perPage={30}
        />
      </div>
    </>
  );
}

export default FilteredProductList;

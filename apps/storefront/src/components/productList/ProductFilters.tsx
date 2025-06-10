"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseQueryAttributeFilters } from "./attributes";
import { getAllAvailableFilters } from "@/lib/filter-utils";
import ProductFilterDropdowns from "./ProductFilterDropdowns";
import { FilterDropdownOption } from "./FilterDropdown";

interface ProductFiltersProps {
  optionToggle: (attributeSlug: string, choiceSlug: string) => void;
  categoryIDs?: string[];
  categorySlug?: string;
  collectionIDs?: string[];
  productsIDs?: string[];
  search?: any;
}

interface FilterConfig {
  label: string;
  inputType: string;
  options: Array<{
    slug: string;
    label: string;
    value: string;
  }>;
}

interface FilterData {
  values: string[];
  config: FilterConfig;
}

interface TransformedFilter {
  values: string[];
  config: FilterConfig;
  options: FilterDropdownOption[];
}

export default function ProductFilters({
  optionToggle,
  categorySlug,
  collectionIDs,
  productsIDs,
  search,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<any>({});
  const searchParams = useSearchParams();

  // Get filters from URL without subscribing to changes
  const queryFilters = useMemo(() => {
    const filtersString = searchParams.get("filters");
    return filtersString ? parseQueryAttributeFilters(filtersString) : [];
  }, [searchParams]);

  // Transform query filters into an object with filter slugs as keys
  const filtersObject = useMemo(() => {
    return queryFilters.reduce(
      (acc, filter) => {
        acc[filter.slug] = filter.values;
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }, [queryFilters]);

  // Get attributes excluding categories
  const selectedAttributes = useMemo(() => {
    return Object.entries(filtersObject)
      .filter(([slug]) => slug !== "categorie")
      .reduce(
        (acc, [slug, values]) => {
          if (values.length) {
            acc[slug] = values;
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );
  }, [filtersObject]);

  const mainFilter = useMemo(() => {
    let mf: Record<string, string[]> = {};
    let selectedCategories = filtersObject.categorie || [];
    if (categorySlug && !selectedCategories.includes(categorySlug)) {
      selectedCategories.push(categorySlug);
    }
    if (selectedCategories?.length > 0) {
      mf.categorie = selectedCategories;
    }
    if (collectionIDs) {
      mf.collections = collectionIDs;
    }
    if (productsIDs && productsIDs.length) {
      mf.ids = productsIDs;
    }
    if (search) {
      mf.search = search.search;
    }
    return mf;
  }, [filtersObject, categorySlug, collectionIDs, productsIDs, search]);

  // Toggle attribute filter (add if not present, remove if present)
  const toggleAttributeFilter = useCallback(
    (attributeSlug: string, choiceSlug: string) => {
      // Check if this filter is already applied
      const isFilterAlreadyApplied = queryFilters.some(
        (filter) => filter.slug === attributeSlug && filter.values.includes(choiceSlug),
      );

      // Use the parent component's optionToggle function to update the URL
      optionToggle(attributeSlug, choiceSlug);
    },
    [queryFilters, optionToggle],
  );

  // This function transforms the raw filter data into options for the dropdowns.
  // It's memoized to prevent re-creation unless its dependencies change.
  const transformToFilterOptions = useCallback(
    (filterData: FilterData, filterKey: string): FilterDropdownOption[] => {
      return filterData.config.options.map((option) => {
        const isChosen =
          filterKey === "categorie"
            ? mainFilter.categorie?.includes(option.slug)
            : selectedAttributes[filterKey]?.includes(option.slug);

        return {
          id: option.slug,
          label: option.label,
          slug: option.slug,
          chosen: isChosen || false,
          value: option.value,
          inputType: filterData.config.inputType,
        };
      });
    },
    [mainFilter, selectedAttributes],
  ); // Dependencies for transformToFilterOptions

  useEffect(() => {
    const fetchAvailableFilters = async () => {
      try {
        const availableFilters = await getAllAvailableFilters(selectedAttributes, mainFilter);
        const transformedFilterOptions = Object.entries(availableFilters).reduce(
          (acc, [key, value]) => {
            const filterData = value as FilterData;
            return {
              ...acc,
              [key]: {
                values: filterData.values,
                config: filterData.config,
                options: transformToFilterOptions(filterData, key),
              },
            };
          },
          {} as Record<string, TransformedFilter>,
        );
        setFilters(transformedFilterOptions);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
        setFilters({});
      }
    };

    fetchAvailableFilters();
  }, [JSON.stringify(queryFilters), categorySlug, collectionIDs, productsIDs, search]);

  return (
    <>
      <ProductFilterDropdowns
        availableFilters={filters}
        addAttributeFilter={toggleAttributeFilter}
      />
    </>
  );
}

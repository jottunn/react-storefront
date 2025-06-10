"use client";
import React, { useMemo } from "react";
import FilterDropdown from "./FilterDropdown";
import { FilterDropdownOption } from "./FilterDropdown";

interface FilterConfig {
  label: string;
  inputType: string;
  options: Array<{
    slug: string;
    label: string;
  }>;
}

interface Filter {
  values: string[];
  config: FilterConfig;
  options: FilterDropdownOption[];
}

interface ProductFilterDropdownsProps {
  availableFilters: Record<string, Filter>;
  addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
}

const ProductFilterDropdowns: React.FC<ProductFilterDropdownsProps> = ({
  availableFilters,
  addAttributeFilter,
}) => {
  const sortedFilters = useMemo(() => {
    if (!availableFilters) return [];

    return Object.entries(availableFilters).sort(([keyA], [keyB]) => {
      if (keyA === "categorie") return -1;
      if (keyB === "categorie") return 1;
      return keyA.localeCompare(keyB);
    });
  }, [availableFilters]);

  return (
    <div className="flex flex-col gap-4">
      {sortedFilters.map(([filterKey, filter]) => (
        <FilterDropdown
          key={filterKey}
          label={filter.config.label}
          optionToggle={addAttributeFilter}
          attributeSlug={filterKey}
          options={filter.options}
        />
      ))}
    </div>
  );
};

export default ProductFilterDropdowns;

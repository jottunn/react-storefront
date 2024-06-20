"use client";
import React from "react";
import FilterDropdown from "./FilterDropdown";
import { Attribute1, getCategoryFilterOptions, getFilterOptions } from "./attributes";
import { FilterPill } from "./FilterPills";

export interface FilterDropdownProps {
  attributeFilters: Attribute1[];
  categoryFilters: any[];
  addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
  pills: FilterPill[];
}

const FilterDropdowns: React.FC<FilterDropdownProps> = ({
  attributeFilters,
  categoryFilters,
  addAttributeFilter,
  pills,
}) => {
  // console.log(categoryFilters);
  return (
    <>
      {categoryFilters && categoryFilters.length > 0 && (
        <FilterDropdown
          key="category-filters"
          label="Categorie"
          optionToggle={addAttributeFilter}
          attributeSlug="categorie"
          options={getCategoryFilterOptions(categoryFilters, pills)}
        />
      )}
      {attributeFilters &&
        attributeFilters.map((attribute) => (
          <FilterDropdown
            key={attribute.id}
            label={attribute.name ?? ""}
            optionToggle={addAttributeFilter}
            attributeSlug={attribute.slug}
            options={getFilterOptions(attribute, pills)}
          />
        ))}
    </>
  );
};

export default FilterDropdowns;

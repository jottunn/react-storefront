"use client";
import React from "react";
import FilterDropdown from "./FilterDropdown";
import { Attribute1, getFilterOptions } from "./attributes";
import { FilterPill } from "./FilterPills";

export interface FilterDropdownProps {
  attributeFilters: Attribute1[];
  addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
  pills: FilterPill[];
}

const FilterDropdowns: React.FC<FilterDropdownProps> = ({
  attributeFilters,
  addAttributeFilter,
  pills,
}) => {
  return (
    <>
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
    </>
  );
};

export default FilterDropdowns;

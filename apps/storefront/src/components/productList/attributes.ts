"use client";
import { translate } from "@/lib/translations";
import { FilterDropdownOption } from "./FilterDropdown";
import { FilterPill } from "./FilterPills";
import { AttributeValue } from "@/saleor/api";

export interface UrlFilter {
  slug: string;
  values: string[];
}

export const getPillsData = (
  urlFilters: UrlFilter[],
  attributeFiltersData: Attribute1[],
): FilterPill[] =>
  urlFilters.reduce((result: FilterPill[], filter: UrlFilter) => {
    const choiceAttribute = attributeFiltersData.find((attr) => attr.slug === filter.slug);
    const attrName = choiceAttribute ? choiceAttribute.name : filter.slug;
    const newPills = filter.values.map((value) => {
      return {
        label: attrName ? `${attrName}: ${value}` : value,
        choiceSlug: value,
        attributeSlug: filter.slug,
      };
    });
    return [...result, ...newPills];
  }, []);

export interface Attribute1 {
  id: string;
  slug: string;
  name: string;
  inputType: string; // If inputType has a limited set of values, you can use union types, e.g., 'DROPDOWN' | 'TEXT'
  values: AttributeValue[];
}

export const getFilterOptions = (
  attribute: Attribute1,
  appliedFilters: FilterPill[],
): FilterDropdownOption[] => {
  // console.log('getFilterOptions', attribute);
  const choices = attribute.values;
  return choices.map((choice) => ({
    chosen: !!appliedFilters.find(
      (pill) => pill.attributeSlug === attribute.slug && pill.choiceSlug === choice.slug,
    ),
    id: choice.id,
    label: translate(choice, "name") || choice.id,
    slug: choice.slug || choice.id,
    value: choice.value || "",
    inputType: choice.inputType || attribute.inputType,
  }));
};

export const getCategoryFilterOptions = (
  categories: any[],
  appliedFilters: FilterPill[],
): FilterDropdownOption[] => {
  return categories.map((category) => ({
    chosen: !!appliedFilters.find(
      (pill) => pill.attributeSlug === "categorie" && pill.choiceSlug === category.slug,
    ),
    id: category.id,
    label: translate(category, "name") || category.id,
    slug: category.slug || category.id,
    value: category.name || "",
    inputType: "category",
  }));
};

export const parseQueryAttributeFilters = (query: string): UrlFilter[] => {
  const filters = query.split(";").flatMap((attributeWithValues) => {
    const splitted = attributeWithValues.split(".");
    const attributeFilter: UrlFilter = { slug: splitted[0], values: splitted.slice(1) };
    if (attributeFilter.values.length > 0) {
      return [attributeFilter];
    }
    return [];
  });
  return filters;
};

export const serializeQueryAttributeFilters = (values: UrlFilter[]): string =>
  values.map((value) => [value.slug, ...value.values].join(".")).join(";");

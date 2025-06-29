"use client";
import { AttributeValue } from "@/saleor/api";

export interface UrlFilter {
  slug: string;
  values: string[];
}

export interface Attribute1 {
  id: string;
  slug: string;
  name: string;
  inputType: string; // If inputType has a limited set of values, you can use union types, e.g., 'DROPDOWN' | 'TEXT'
  values: AttributeValue[];
}

export const parseQueryAttributeFilters = (query: string): UrlFilter[] => {
  if (!query || query.trim() === "") {
    return [];
  }

  const filters = query.split("_").flatMap((attributeWithValues) => {
    const splitted = attributeWithValues.split("--");

    // Check if we have both slug and values parts
    if (splitted.length < 2 || !splitted[0] || !splitted[1]) {
      return [];
    }

    const splittedValues = splitted[1].split(",");
    const attributeFilter: UrlFilter = { slug: splitted[0], values: splittedValues };
    if (attributeFilter.values.length > 0) {
      return [attributeFilter];
    }
    return [];
  });
  return filters;
};

export const serializeQueryAttributeFilters = (values: UrlFilter[]): string => {
  if (values.length === 0) {
    return "";
  }

  const serializedGroups = values.map((filterGroup) => {
    // 1. Get the slug (e.g., "culoare")
    const slug = filterGroup.slug;

    // 2. Join the sorted values with a comma
    const joinedValues = filterGroup.values.join(",");

    // 3. Combine slug and joined values with '--' (e.g., "culoare--rosu,albastru,dark-gray")
    return `${slug}--${joinedValues}`;
  });

  // 4. Join all the filter groups with '_' (e.g., "culoare--..._gen--...")
  return serializedGroups.join("_");
};

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

import { getFilterIndex } from "src/app/actions";

// Define types
type FilterValue = string;
type FilterSlug = string;
type FilterSelection = {
  [key: FilterSlug]: FilterValue[];
};
type MainFilter = {
  collections?: string[];
  categorie?: string[];
  search?: string;
  ids?: string[];
};

// Helper function to get size sort order
function getSizeSortOrder(size: string): number {
  const sizeOrder: Record<string, number> = {
    // Letter sizes
    xxs: 0,
    xs: 1,
    s: 2,
    sm: 3,
    m: 4,
    ml: 5,
    l: 6,
    xl: 7,
    xxl: 8,
    xxxl: 9,
    "2xl": 10,
    "3xl": 11,
    "4xl": 12,
    // Special values
    os: 100, // one size - goes at the end
  };

  // If it's a predefined letter size, use that order
  if (sizeOrder[size] !== undefined) {
    return sizeOrder[size];
  }

  // If it's a numeric size, convert to number and add offset to place after letter sizes
  const numericValue = parseInt(size, 10);
  if (!isNaN(numericValue)) {
    return 50 + numericValue; // Offset by 50 to place after letter sizes but before special values
  }

  // Unknown sizes go to the very end
  return 999;
}

// Generic sorting function for attribute values
function sortAttributeValues(attrSlug: string, values: string[]): string[] {
  if (attrSlug === "marime") {
    const sorted = values.sort((a, b) => {
      const orderA = getSizeSortOrder(a);
      const orderB = getSizeSortOrder(b);
      return orderA - orderB;
    });
    return sorted;
  } else {
    // Default alphabetical sorting for all other attributes (including colors)
    return values.sort();
  }
}

// Helper function to check if a product matches all current selections
function productMatchesSelections(product: any, currentSelection: FilterSelection): boolean {
  // Check each selected attribute
  for (const [attrSlug, selectedValues] of Object.entries(currentSelection)) {
    const productValues = product.attributes?.[attrSlug] || [];
    // Product must have at least one of the selected values
    if (!selectedValues.some((value) => productValues.includes(value))) {
      return false;
    }
  }
  return true;
}

// Helper function to get available categories for collections
function getAvailableCategoriesForCollections(
  index: any,
  collectionIds: string[],
  currentSelection: FilterSelection,
): string[] {
  const categories = new Set<string>();

  // Look through all products in the collections
  Object.entries(index.products).forEach(([productId, product]: [string, any]) => {
    // Check if product is in any of the specified collections
    if (!product.collections?.some((col: string) => collectionIds.includes(col))) {
      return;
    }

    // Check if product matches all current selections
    if (!productMatchesSelections(product, currentSelection)) {
      return;
    }

    // Add the category if all conditions are met
    categories.add(product.category);
  });

  return Array.from(categories).sort();
}

// Helper function to get available values for an attribute
function getAvailableValues(index: any, attrSlug: FilterSlug): FilterValue[] {
  return index.attributes[attrSlug] || [];
}

// Helper function to filter values by main filter criteria
function filterValuesByMainFilter(
  index: any,
  attrSlug: FilterSlug,
  values: FilterValue[],
  mainFilter: MainFilter,
): FilterValue[] {
  // If no main filter criteria, return all values
  if (
    !mainFilter.ids?.length &&
    !mainFilter.search &&
    !mainFilter.collections?.length &&
    !mainFilter.categorie?.length
  ) {
    return values;
  }

  return values.filter((value) => {
    const meta = index.metadata[attrSlug]?.[value];
    if (!meta) return false;

    // Get all product IDs that have this attribute value
    const productIds = meta.productIds;

    // Filter by product IDs if specified
    if (mainFilter.ids?.length) {
      const hasMatchingId = productIds.some((id: string) => mainFilter.ids!.includes(id));
      if (!hasMatchingId) return false;
    }

    // Filter by search term if specified
    if (mainFilter.search) {
      const searchTerm = mainFilter.search.toLowerCase();
      const hasMatchingProduct = productIds.some((id: string) => {
        const product = index.products[id];
        return product.name.toLowerCase().includes(searchTerm);
      });
      if (!hasMatchingProduct) return false;
    }

    // Filter by collections if specified
    if (mainFilter.collections?.length) {
      const inCollection = meta.collections.some((col: string) =>
        mainFilter.collections!.includes(col),
      );
      if (!inCollection) return false;
    }

    // Filter by categories if specified
    if (mainFilter.categorie?.length) {
      const inCategory = meta.categories.some((cat: string) => mainFilter.categorie!.includes(cat));
      if (!inCategory) return false;
    }

    return true;
  });
}

// Helper to get all descendant categories for a given ancestor slug
function getDescendantCategories(categoryStructure: any[], ancestorSlug: string): string[] {
  return categoryStructure
    .filter((cat) => cat.ancestors?.some((ancestor: any) => ancestor.slug === ancestorSlug))
    .map((cat) => cat.slug);
}

// Helper function to get available values for an attribute
function getAvailableValuesForSelection(
  index: any,
  attrSlug: FilterSlug,
  currentSelection: FilterSelection,
  mainFilter: MainFilter,
): FilterValue[] {
  // Get all possible values for this attribute
  const allValues = new Set(getAvailableValues(index, attrSlug));
  const validValues = new Set<string>();

  // --- CATEGORY FILTERING LOGIC REWRITE ---
  // If filtering by category, build allowed categories set
  let allowedCategories: Set<string> | null = null;
  if ((mainFilter.categorie?.length ?? 0) === 1) {
    const selectedCat = mainFilter.categorie![0];
    const descendantCategories = getDescendantCategories(index.categoryStructure, selectedCat);
    allowedCategories = new Set([selectedCat, ...descendantCategories]);
  } else if ((mainFilter.categorie?.length ?? 0) > 1) {
    // If multiple categories selected, union all their descendants
    allowedCategories = new Set();
    for (const selectedCat of mainFilter.categorie!) {
      allowedCategories.add(selectedCat);
      getDescendantCategories(index.categoryStructure, selectedCat).forEach((slug) =>
        allowedCategories!.add(slug),
      );
    }
  }

  Object.entries(index.products).forEach(([productId, product]: [string, any]) => {
    // Skip if product is not in any of the specified collections
    if (
      mainFilter.collections?.length &&
      !product.collections?.some((col: string) => mainFilter.collections!.includes(col))
    ) {
      return;
    }

    // --- CATEGORY FILTERING ---
    if (allowedCategories) {
      if (!allowedCategories.has(product.category)) {
        return;
      }
    }

    // Skip if product doesn't match current selections (except for the attribute we're checking)
    const otherSelections = { ...currentSelection };
    delete otherSelections[attrSlug];
    if (!productMatchesSelections(product, otherSelections)) {
      return;
    }

    // Add all values for this attribute from matching products
    const productValues = product.attributes?.[attrSlug] || [];
    productValues.forEach((value: FilterValue) => {
      if (allValues.has(value)) {
        validValues.add(value);
      }
    });
  });

  // If we found any valid values, return them
  // Otherwise, return all values (this happens when there are no relationships found)
  const resultValues = Array.from(validValues.size > 0 ? validValues : allValues);
  return sortAttributeValues(attrSlug, resultValues);
}

// Helper function to get all available filters
export async function getAllAvailableFilters(
  currentSelection: FilterSelection,
  mainFilter: MainFilter,
): Promise<any> {
  const index = await getFilterIndex();
  const allAttributeSlugs = Object.keys(index.attributes);
  const availableFilters: any = {};

  // Always show available categories if we have collections
  if (mainFilter.collections?.length) {
    const categories = getAvailableCategoriesForCollections(
      index,
      mainFilter.collections,
      currentSelection,
    );
    // availableFilters['categories'] = categories;
    if (categories.length > 0) {
      availableFilters["categorie"] = {
        values: categories,
        config: {
          label: "Categorie",
          inputType: "DROPDOWN",
          options: categories.map((categorySlug) => {
            // Find category info from the index
            const categoryInfo = index.categoryStructure?.find(
              (cat: any) => cat.slug === categorySlug,
            );
            return {
              slug: categorySlug,
              label: categoryInfo?.name || categorySlug,
              inputType: "DROPDOWN",
              // Add additional category info if needed
              id: categoryInfo?.id,
              ancestors: categoryInfo?.ancestors || [],
            };
          }),
        },
      };
    }
  }

  // First, get all values that match the main filter criteria
  const mainFilteredValues: { [key: FilterSlug]: Set<FilterValue> } = {};
  allAttributeSlugs.forEach((attrSlug) => {
    const values = getAvailableValues(index, attrSlug);
    const filteredValues = filterValuesByMainFilter(index, attrSlug, values, mainFilter);
    mainFilteredValues[attrSlug] = new Set(filteredValues);
  });

  // Then, for each attribute, get values that are both in the main filter and related to the current selection
  allAttributeSlugs.forEach((attrSlug) => {
    // Get available values for this attribute based on current selection
    let values = getAvailableValuesForSelection(index, attrSlug, currentSelection, mainFilter);

    // Intersect with main filter values
    values = values.filter((value) => mainFilteredValues[attrSlug].has(value));

    // If this attribute has selected values, make sure they're included
    if (currentSelection[attrSlug]) {
      const selectedValues = currentSelection[attrSlug];
      // Add selected values that are in the main filter
      selectedValues.forEach((value) => {
        if (mainFilteredValues[attrSlug].has(value)) {
          values.push(value);
        }
      });
      // Remove duplicates and sort
      values = [...new Set(values)];
    }

    // Apply proper sorting for this attribute
    values = sortAttributeValues(attrSlug, values);

    // availableFilters[attrSlug] = values;
    // Add the values and config to availableFilters
    if (values.length > 0 || currentSelection[attrSlug]?.length > 0) {
      availableFilters[attrSlug] = {
        values: values,
        config: index.attributeConfig?.[attrSlug]
          ? {
              ...index.attributeConfig[attrSlug],
              options: index.attributeConfig[attrSlug].options.filter((option: { slug: string }) =>
                values.includes(option.slug),
              ),
            }
          : undefined,
      };
    }
  });

  return availableFilters;
}

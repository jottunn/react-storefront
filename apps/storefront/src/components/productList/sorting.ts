import { Messages } from "@/lib/util";
import { OrderDirection, ProductOrderField } from "@/saleor/api";

export interface UrlSorting {
  field: ProductOrderField;
  direction: OrderDirection;
}

export interface SortingOption {
  label: string;
  field?: ProductOrderField;
  direction?: OrderDirection;
  chosen: boolean;
}

export const getSortingOptions = (chosenSorting: UrlSorting | null, messages: Messages) => {
  const options: SortingOption[] = [
    {
      label: messages["app.sort.sortByDefault"],
      chosen: false,
      field: "CREATED_AT",
      direction: "DESC",
    },
    {
      label: messages["app.sort.sortByPriceAsc"],
      field: "PRICE",
      direction: "ASC",
      chosen: false,
    },
    {
      label: messages["app.sort.sortByPriceDesc"],
      field: "PRICE",
      direction: "DESC",
      chosen: false,
    },
    {
      label: messages["app.sort.sortByLatest"],
      field: "DATE",
      direction: "DESC",
      chosen: false,
    },
    {
      label: messages["app.sort.sortByOldest"],
      field: "DATE",
      direction: "ASC",
      chosen: false,
    },
    {
      label: messages["app.sort.sortByNameAsc"],
      field: "NAME",
      direction: "ASC",
      chosen: false,
    },
  ];

  let isChosenSet = false;
  for (const option of options) {
    if (option.field === chosenSorting?.field && option.direction === chosenSorting?.direction) {
      option.chosen = true;
      isChosenSet = true;
      break;
    }
  }
  if (!isChosenSet) {
    options[0].chosen = true;
  }
  return options;
};

export const parseQuerySort = (query: string | null): UrlSorting | null => {
  if (!query) {
    return null;
  }

  // Find the index of the last underscore, which separates the field from the direction
  const lastUnderscoreIndex = query.lastIndexOf("_");

  if (lastUnderscoreIndex === -1) {
    return null; // No underscore found, invalid format
  }

  const field = query.substring(0, lastUnderscoreIndex);
  const direction = query.substring(lastUnderscoreIndex + 1);

  if (!field || !direction) {
    return null; // Either field or direction is empty after splitting
  }

  const sorting: UrlSorting = {
    field: field as ProductOrderField,
    direction: direction as OrderDirection,
  };

  return sorting;
};

export const serializeQuerySort = (value?: UrlSorting | null) => {
  if (value?.direction && value?.field) {
    return `${value.field}_${value.direction}`;
  }
  return null;
};

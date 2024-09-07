import React, { useCallback, useEffect, useState } from "react";
import { useClient } from "urql";
import { Box, Spinner, Text } from "@saleor/macaw-ui";
import { fetchSales } from "./modules/sales/get-sales";
import { FieldValues } from "react-hook-form";
import {
  fetchCategories,
  fetchCollections,
} from "./modules/collections/get-collections-categories";
import { addRules } from "./modules/rules/add-sale-rules";
import { Collection, CollectionFilterInput } from "../generated/graphql";
import { fetchSaleCollections } from "./modules/collections/get-sale-collections";
import SaleForm from "./modules/rules/SaleForm";

type Sale = {
  id: string;
  name: string;
  privateMetadata: Array<{ key: string; value: string }>;
  rules: any[];
};

type Collection1 = {
  id: string;
  name: string;
  parent: any;
  __typename: string;
};

type Category = {
  id: string;
  name: string;
  parent: any;
  __typename: string;
};

type Rule = {
  collections?: string[];
  categories?: string[];
};
type State = {
  availableSales: Sale[];
  collections: Collection1[];
  brandCollections: Collection1[];
  categories: Category[];
  saleCollections: any[];
  loading: boolean;
  errors: string[];
  successMessage: string | null;
};
export const UpdateRules: React.FC = () => {
  const client = useClient();
  const [state, setState] = useState<State>({
    availableSales: [],
    collections: [],
    brandCollections: [],
    categories: [],
    saleCollections: [],
    loading: true,
    errors: [],
    successMessage: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const sales = await fetchSales(client, false);
      setState((prevState) => ({ ...prevState, availableSales: sales }));
    } catch (error) {
      console.error("Error fetching sales:", error);
      setState((prevState) => ({
        ...prevState,
        errors: [...prevState.errors, "Error fetching sales"],
      }));
    }
  }, [client]);

  const fetchCollectionsData = useCallback(async () => {
    try {
      let collections = await fetchCollections(client);
      const filteredBrandCollection = collections.filter((collection) =>
        collection.metadata?.some(
          (meta: { key: string; value: string }) => meta.key === "isBrand" && meta.value === "YES"
        )
      );
      const filteredSalesCollections = collections.filter((collection) =>
        collection.metadata?.some(
          (meta: { key: string; value: string }) => meta.key === "isSale" && meta.value === "YES"
        )
      );
      collections = collections.filter(
        (collection) =>
          !filteredSalesCollections.some((saleCollection) => saleCollection.id === collection.id)
      );
      setState((prevState) => ({
        ...prevState,
        collections,
        brandCollections: filteredBrandCollection,
      }));
    } catch (error) {
      console.error("Error fetching collections:", error);
      setState((prevState) => ({
        ...prevState,
        errors: [...prevState.errors, "Error fetching collections"],
      }));
    }
  }, [client]);

  const fetchCategoriesData = useCallback(async () => {
    try {
      const categories = await fetchCategories(client);
      setState((prevState) => ({ ...prevState, categories, loading: false }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setState((prevState) => ({
        ...prevState,
        loading: false,
        errors: [...prevState.errors, "Error fetching categories"],
      }));
    }
  }, [client]);

  const fetchSalesCollections = useCallback(async () => {
    try {
      const collectionFilter: CollectionFilterInput = {
        metadata: [{ key: "isSale", value: "YES" }],
      };
      const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
      setState((prevState) => ({
        ...prevState,
        saleCollections: saleCollectionsArr,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setState((prevState) => ({
        ...prevState,
        loading: false,
        errors: [...prevState.errors, "Error fetching categories"],
      }));
    }
  }, [client]);

  useEffect(() => {
    fetchData();
    fetchCollectionsData();
    fetchCategoriesData();
    fetchSalesCollections();
  }, [fetchData, fetchCollectionsData, fetchCategoriesData, fetchSalesCollections]);

  const getChildrenCategories = useCallback(
    (categoryId: string) => {
      let currentCategory = state.categories.filter((categ) => categ.id === categoryId);
      if (currentCategory[0] && currentCategory[0].parent === null) {
        const children = state.categories.filter(
          (categ) => categ.parent && categ.parent.id === currentCategory[0].id
        );
        return children.map((child) => child.id);
      }
      return [];
    },
    [state.categories]
  );

  const onSubmit = useCallback(
    async (data: FieldValues, saleId: string) => {
      console.log("submit", data);
      setState((prevState) => ({ ...prevState, loading: true, successMessage: null }));
      const errorList: string[] = [];

      const sale = state.availableSales.find((s) => s.id === saleId);
      if (sale) {
        const selectedCategories = data[`categories-${sale.id}`] || [];

        const finalCategories = [...selectedCategories];
        selectedCategories.forEach((category: string) => {
          const children = getChildrenCategories(category);
          if (children.length > 0) {
            finalCategories.push(...children);
          }
        });
        const selectedCollections = data[`collections-${sale.id}`] || [];

        const brandCollectionIds = new Set(
          state.brandCollections.map((brandCollection) => brandCollection.id)
        );

        const filteredSelectedCollections = selectedCollections.filter(
          (selectedCollection: string) => !brandCollectionIds.has(selectedCollection)
        );

        const filteredBrandCollections = state.brandCollections.filter((brandCollection) =>
          selectedCollections.includes(brandCollection.id)
        );

        const errors = await addRules(
          client,
          sale.id,
          selectedCategories,
          finalCategories,
          filteredSelectedCollections,
          filteredBrandCollections,
          selectedCollections
        );

        if (errors && errors.length > 0) {
          errorList.push(`Errors for sale ${sale.name}: ${errors.join(", ")}`);
        }

        setState((prevState) => ({
          ...prevState,
          availableSales: prevState.availableSales.map((sale) =>
            sale.id === saleId
              ? {
                  ...sale,
                }
              : sale
          ),
          loading: false,
          errors: errorList,
          successMessage: errorList.length === 0 ? "Sale updated successfully!" : null,
        }));
        await fetchData();
        await fetchCollectionsData();
        await fetchCategoriesData();
        await fetchSalesCollections();
      }
    },
    [client, state.availableSales, state.brandCollections, getChildrenCategories]
  );

  const extractValues = useCallback(
    (saleId: string, field: keyof Rule) => {
      const filteredSaleCollection = state.saleCollections.filter((saleCollection) =>
        saleCollection.metadata?.some(
          (meta: { key: string; value: string }) => meta.key === "sale" && meta.value === saleId
        )
      );
      const allIds = state[field].map((item) => item.id);
      if (filteredSaleCollection.length > 0 && filteredSaleCollection[0].privateMetadata) {
        const privateMetadata = filteredSaleCollection[0].privateMetadata;
        const andRulesItem = privateMetadata.find(
          (item: { key: string }) => item.key === "AndRules"
        );
        if (andRulesItem) {
          const andRules = andRulesItem.value;
          try {
            const rulesArray: Rule[] = JSON.parse(andRules);
            const values = rulesArray.reduce<string[]>((acc, rule) => {
              let fieldValues = rule[field];
              if (fieldValues) {
                fieldValues = fieldValues.filter((id) => allIds.includes(id));
                return acc.concat(fieldValues.filter(Boolean));
              }
              return acc;
            }, []);
            return values;
          } catch (error) {
            console.error("Error parsing JSON:", error);
            return [];
          }
        }
      }
      return [];
    },
    [state.saleCollections, state.collections, state.categories]
  );

  const getOptions = useCallback(
    (obj1: (Collection | Category)[], selectedIds: string[], type?: string) => {
      const allIds = state[type === "collection" ? "collections" : "categories"].map(
        (item) => item.id
      );
      const finalSelectedIds = selectedIds.filter((id) => allIds.includes(id));
      return obj1.map((item) => ({
        label: item.name,
        value: item.id,
        selected: finalSelectedIds.includes(item.id),
      }));
    },
    [state.collections, state.categories]
  );

  if (state.loading) {
    return <Spinner />;
  }

  return (
    <>
      <Text variant="heading">Add rules for sales</Text>
      <Text as={"p"}>
        All other rules already added to the Discount will be removed and only below rules will be
        applied.{" "}
        <strong>Any existing products already added to the Discount will be overwritten.</strong>
      </Text>
      {state.errors.length > 0 && (
        <Box marginBottom={4}>
          {state.errors.map((error, index) => (
            <Text key={index} style={{ color: "red" }}>
              {error}
            </Text>
          ))}
        </Box>
      )}
      {state.successMessage && (
        <Box marginBottom={4}>
          <Text style={{ color: "green" }}>{state.successMessage}</Text>
        </Box>
      )}
      <Box padding={4} display="flex" flexDirection="column" gap={4}>
        {state.availableSales.map((sale, index) => {
          const collectionValues = extractValues(sale.id, "collections") || [];
          const categoryValues = extractValues(sale.id, "categories") || [];
          const collectionOptions = getOptions(state.collections, collectionValues, "collection");
          const categoryOptions = getOptions(state.categories, categoryValues, "category");
          return (
            <SaleForm
              key={sale.id}
              sale={sale}
              onSubmit={onSubmit}
              collectionValues={collectionValues}
              categoryValues={categoryValues}
              collectionOptions={collectionOptions}
              categoryOptions={categoryOptions}
            />
          );
        })}
      </Box>
    </>
  );
};

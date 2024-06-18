import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "urql";
import { Box, Button, Multiselect, Spinner, Text } from "@saleor/macaw-ui";
import { fetchSales } from "./modules/sales/get-sales";
import { Controller, useForm } from "react-hook-form";
import {
  fetchCategories,
  fetchCollections,
} from "./modules/collections/get-collections-categories";
import { addRules } from "./modules/rules/add-sale-rules";
import { Collection, CollectionFilterInput } from "../generated/graphql";
import { fetchSaleCollections } from "./modules/collections/get-sale-collections";

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

  const { control, handleSubmit, setValue, reset } = useForm();

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
      //filter out sales collections
      collections = collections.filter(
        (collection) =>
          !filteredSalesCollections.some((saleCollection) => saleCollection.id === collection.id)
      );
      // filteredBrandCollection.forEach(brandCollection => {
      //   collections = collections.filter(collection => collection.id !== brandCollection.id)
      // })
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
    async (data: any) => {
      setState((prevState) => ({ ...prevState, loading: true, successMessage: null }));
      const errorList: string[] = [];
      // console.log('data', data);
      for (const sale of state.availableSales) {
        const selectedCategories = data[`categories-${sale.id}`] || [];

        const finalCategories = [...selectedCategories];
        selectedCategories.forEach((category: string) => {
          const children = getChildrenCategories(category);
          if (children.length > 0) {
            finalCategories.push(...children);
          }
        });
        const selectedCollections = data[`collections-${sale.id}`] || [];
        // Step 1: Create a set of IDs from brandCollections

        const brandCollectionIds = new Set(
          state.brandCollections.map((brandCollection) => brandCollection.id)
        );
        // Step 2: Filter out collections from selectedCollections that are in brandCollections

        const filteredSelectedCollections = selectedCollections.filter(
          (selectedCollection: string) => !brandCollectionIds.has(selectedCollection)
        );
        // Step3: Get only selected brand collections

        const filteredBrandCollections = state.brandCollections.filter((brandCollection) =>
          selectedCollections.includes(brandCollection.id)
        );

        //if (selectedCategories.length > 0 || filteredSelectedCollections.length > 0) {
        const errors = await addRules(
          client,
          sale.id,
          selectedCategories,
          finalCategories,
          filteredSelectedCollections,
          filteredBrandCollections,
          selectedCollections
        );
        // console.log('errors submit', errors);
        if (errors && errors.length > 0) {
          errorList.push(`Errors for sale ${sale.name}: ${errors.join(", ")}`);
        }
        // }
      }
      setState((prevState) => ({
        ...prevState,
        loading: false,
        errors: errorList,
        successMessage: errorList.length === 0 ? "All sales updated successfully!" : null,
      }));
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

  const defaultValues = useMemo(() => {
    return state.availableSales.reduce((acc, sale) => {
      const collectionValues = extractValues(sale.id, "collections") || [];
      const categoryValues = extractValues(sale.id, "categories") || [];
      acc[`categories-${sale.id}`] = categoryValues;
      acc[`collections-${sale.id}`] = collectionValues;
      return acc;
    }, {} as { [key: string]: any[] });
  }, [state.availableSales, extractValues]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  if (state.loading) {
    return <Spinner />;
  }

  return (
    <>
      <Text variant="heading">Add rules for sales</Text>
      <Text as={"p"}>
        All other rules already added to the Discount will be removed and only below rules will be
        applied.
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box padding={4} display="flex" flexDirection="column" gap={4}>
          <Box display="flex" flexDirection="column" gap={4}>
            <div>
              {state.availableSales.map((sale, index) => {
                const collectionValues = extractValues(sale.id, "collections") || [];
                const categoryValues = extractValues(sale.id, "categories") || [];
                // console.log("collectionValues", collectionValues);
                // console.log("categoryValues", categoryValues);
                const collectionOptions = getOptions(
                  state.collections,
                  collectionValues,
                  "collection"
                );
                const categoryOptions = getOptions(state.categories, categoryValues, "category");
                return (
                  <div
                    className="grid-row"
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "130px 1fr 50px 1fr",
                      gridGap: "20px",
                      borderTop: "1px solid lightblue",
                      borderBottom: "1px solid lightblue",
                      padding: "40px 0",
                    }}
                  >
                    <input
                      type="hidden"
                      {...control.register(`saleId-${sale.id}`)}
                      value={sale.id}
                    />
                    <div>
                      <label>
                        <Text>
                          Modify rules for:
                          <br /> <strong>{sale.name}</strong>
                        </Text>
                      </label>
                    </div>
                    <div>
                      <label>
                        <Text>Choose Category:</Text>
                      </label>
                      <Controller
                        name={`categories-${sale.id}`}
                        control={control}
                        defaultValue={categoryValues}
                        render={({ field }) => (
                          <Multiselect
                            {...field}
                            label="Categories"
                            size="medium"
                            options={categoryOptions}
                            value={field.value || categoryValues}
                            onChange={(selected) => {
                              const selectedValues = selected.map((option: any) => option.value);
                              field.onChange(selectedValues);
                              setValue(`categories-${sale.id}`, selectedValues);
                            }}
                          />
                        )}
                      />
                    </div>
                    <div style={{ alignSelf: "center" }}>
                      <Text
                        variant="heading"
                        style={{ backgroundColor: "lightblue", padding: "4px" }}
                      >
                        AND
                      </Text>
                    </div>
                    <div>
                      <label>
                        <Text>Choose Collections</Text>
                      </label>
                      <Controller
                        name={`collections-${sale.id}`}
                        control={control}
                        defaultValue={collectionValues}
                        render={({ field }) => (
                          <Multiselect
                            {...field}
                            label="Collections"
                            size="medium"
                            options={collectionOptions}
                            value={field.value || collectionValues}
                            onChange={(selected) => {
                              const selectedValues = selected.map((option: any) => option.value);
                              field.onChange(selectedValues);
                              setValue(`collections-${sale.id}`, selectedValues);
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Box>
        </Box>
        <Box>
          <Button type="submit" margin={4}>
            Save all changes
          </Button>
        </Box>
      </form>
    </>
  );
};

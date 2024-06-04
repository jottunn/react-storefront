import React, { useEffect, useState } from "react";
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
  __typename: string;
};

type Category = {
  id: string;
  name: string;
  __typename: string;
};

type Rule = {
  collections?: string[];
  categories?: string[];
};

export const UpdateRules: React.FC = () => {
  const client = useClient();
  const [availableSales, setavailableSales] = useState<Sale[]>([]);
  const [collections, setCollections] = useState<Collection1[]>([]);
  const [brandCollections, setBrandCollections] = useState<Collection1[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saleCollections, setSalesCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { control, handleSubmit, setValue, reset } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sales = await fetchSales(client, false);
        setavailableSales(sales);
      } catch (error) {
        console.error("Error fetching sales:", error);
        setErrors((prevErrors) => [...prevErrors, "Error fetching sales"]);
      }
    };

    const fetchCollectionsData = async () => {
      try {
        let collections = await fetchCollections(client);
        const filteredBrandCollection = collections.filter((collection) =>
          collection.metadata?.some(
            (meta: { key: string; value: string }) => meta.key === "isBrand" && meta.value === "YES"
          )
        );
        // filteredBrandCollection.forEach(brandCollection => {
        //   collections = collections.filter(collection => collection.id !== brandCollection.id)
        // })
        setBrandCollections(filteredBrandCollection);
        setCollections(collections);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setErrors((prevErrors) => [...prevErrors, "Error fetching collections"]);
      }
    };

    const fetchCategoriesData = async () => {
      try {
        const categories = await fetchCategories(client);
        setCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
        setErrors((prevErrors) => [...prevErrors, "Error fetching categories"]);
      }
    };

    const fetchSalesCollectons = async () => {
      try {
        const collectionFilter: CollectionFilterInput = {
          metadata: [{ key: "isSale", value: "YES" }],
        };
        const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
        setSalesCollections(saleCollectionsArr);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
        setErrors((prevErrors) => [...prevErrors, "Error fetching categories"]);
      }
    };

    fetchData();
    fetchCollectionsData();
    fetchCategoriesData();
    fetchSalesCollectons();
  }, [client]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setSuccessMessage(null);
    // console.log('data', data);
    const errorList: string[] = [];
    for (const sale of availableSales) {
      const selectedCategories = data[`categories-${sale.id}`] || [];
      let selectedCollections = data[`collections-${sale.id}`] || [];
      //filter out brand collections and send them separately
      // Step 1: Create a set of IDs from brandCollections
      const brandCollectionIds = new Set(
        brandCollections.map((brandCollection) => brandCollection.id)
      );
      // Step 2: Filter out collections from selectedCollections that are in brandCollections
      const filteredSelectedCollections = selectedCollections.filter(
        (selectedCollection: string) => !brandCollectionIds.has(selectedCollection)
      );
      // Step3: Get only selected brand collections
      const filteredBrandCollections = brandCollections.filter((brandCollection) =>
        selectedCollections.includes(brandCollection.id)
      );

      if (selectedCategories.length > 0 || filteredSelectedCollections.length > 0) {
        const errors = await addRules(
          client,
          sale.id,
          selectedCategories,
          filteredSelectedCollections,
          filteredBrandCollections,
          selectedCollections
        );
        // console.log('errors submit', errors);
        if (errors && errors.length > 0) {
          errorList.push(`Errors for sale ${sale.name}: ${errors.join(", ")}`);
        }
      }
    }

    setLoading(false);
    setErrors(errorList);
    if (errorList.length === 0) {
      setSuccessMessage("All sales updated successfully!");
    }
  };

  const extractValues = (saleId: string, field: keyof Rule) => {
    const filteredSaleCollection = saleCollections.filter((saleCollection) =>
      saleCollection.metadata?.some(
        (meta: { key: string; value: string }) => meta.key === "sale" && meta.value === saleId
      )
    );
    // console.log("filteredSaleCollection", filteredSaleCollection);
    if (filteredSaleCollection.length > 0 && filteredSaleCollection[0].privateMetadata) {
      const privateMetadata = filteredSaleCollection[0].privateMetadata;
      const andRulesItem = privateMetadata.find((item: { key: string }) => item.key === "AndRules");
      if (andRulesItem) {
        const andRules = andRulesItem.value;
        //console.log("andRules", andRules);
        try {
          const rulesArray: Rule[] = JSON.parse(andRules);
          // console.log('rulesArray', rulesArray);
          const values = rulesArray.reduce<string[]>((acc, rule) => {
            const fieldValues = rule[field];
            if (fieldValues) {
              // console.log(fieldValues);
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
  };

  const getOptions = (obj1: (Collection | Category)[], selectedIds: string[]) => {
    return obj1.map((item) => ({
      label: item.name,
      value: item.id,
      selected: selectedIds.includes(item.id),
    }));
  };

  useEffect(() => {
    const defaultValues = availableSales.reduce((acc, sale) => {
      const collectionValues = extractValues(sale.id, "collections") || [];
      const categoryValues = extractValues(sale.id, "categories") || [];
      acc[`categories-${sale.id}`] = categoryValues;
      acc[`collections-${sale.id}`] = collectionValues;
      return acc;
    }, {} as { [key: string]: any[] });

    reset(defaultValues);
  }, [availableSales, reset]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Text variant="heading">Add rules for sales</Text>
      <Text as={"p"}>
        All other rules already added to the Discount will be removed and only below rules will be
        applied.
      </Text>
      {errors.length > 0 && (
        <Box marginBottom={4}>
          {errors.map((error, index) => (
            <Text key={index} style={{ color: "red" }}>
              {error}
            </Text>
          ))}
        </Box>
      )}
      {successMessage && (
        <Box marginBottom={4}>
          <Text style={{ color: "green" }}>{successMessage}</Text>
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box padding={4} display="flex" flexDirection="column" gap={4}>
          <Box display="flex" flexDirection="column" gap={4}>
            <div>
              {availableSales.map((sale, index) => {
                const collectionValues = extractValues(sale.id, "collections") || [];
                const categoryValues = extractValues(sale.id, "categories") || [];
                const collectionOptions = getOptions(collections, collectionValues);
                const categoryOptions = getOptions(categories, categoryValues);
                // console.log('collectionValues', collectionValues);
                // console.log('categoryValues', categoryValues);
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

import React, { useEffect, useState } from "react";
import { useClient } from "urql";
import { Box, Button, Multiselect, Spinner, Text } from "@saleor/macaw-ui";
import { fetchPromotions } from "./modules/promotions/get-promotions";
import { Controller, useForm } from "react-hook-form";
import {
  fetchCategories,
  fetchCollections,
} from "./modules/collections/get-collections-categories";
import { addRules } from "./modules/rules/add-promotion-rules";

type Promotion = {
  id: string;
  name: string;
  privateMetadata: Array<{ key: string; value: string }>;
};

type Collection = {
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
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promotions = await fetchPromotions(client, false);
        console.log("Fetched promotions:", promotions);
        setAvailablePromotions(promotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    const fetchCollectionsData = async () => {
      try {
        const collections = await fetchCollections(client);
        console.log("Fetched collections:", collections);
        setCollections(collections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    const fetchCategoriesData = async () => {
      try {
        const categories = await fetchCategories(client);
        console.log("Fetched categories:", categories);
        setCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchData();
    fetchCollectionsData();
    fetchCategoriesData();
  }, [client]);

  const { control, handleSubmit, setValue, getValues } = useForm();

  const onSubmit = (data: any) => {
    availablePromotions.forEach((promotion, index) => {
      const selectedCategories = data[`categories-${index}`];
      const selectedCollections = data[`collections-${index}`];
      addRules(client, promotion.id, selectedCategories, selectedCollections);
    });
    console.log(data);
  };

  const extractValues = (promotion: Promotion, field: keyof Rule): string[] => {
    const privateMetadata = promotion.privateMetadata || [];
    const andRulesItem = privateMetadata.find((item) => item.key === "AndRules");

    if (andRulesItem) {
      const andRules = andRulesItem.value;
      try {
        const rulesArray: Rule[] = JSON.parse(andRules);
        const values = rulesArray
          .filter((rule) => rule[field]) // Filter objects that have the specified field
          .flatMap((rule) => rule[field] || []); // Flatten the arrays of the specified field

        return values;
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return [];
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

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Text variant="heading">Add rules for promotions:</Text>
      <Text as={"p"}>some more text</Text>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box padding={4} display="flex" flexDirection="column" gap={4}>
          <Box display="flex" flexDirection="column" gap={4}>
            <div>
              {availablePromotions.map((promotion, index) => {
                const collectionValues = extractValues(promotion, "collections") || [];
                const categoryValues = extractValues(promotion, "categories") || [];
                const collectionOptions = getOptions(collections, collectionValues);
                const categoryOptions = getOptions(categories, categoryValues);

                // Set default values for the multiselects
                setValue(`categories-${index}`, categoryValues);
                setValue(`collections-${index}`, collectionValues);

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
                      {...control.register(`promotionId-${index}`)}
                      value={promotion.id}
                    />
                    <div>
                      <label>
                        <Text>
                          Modify rules for:
                          <br /> <strong>{promotion.name}</strong>
                        </Text>
                      </label>
                    </div>
                    <div>
                      <label>
                        <Text>Choose Category:</Text>
                      </label>
                      <Controller
                        name={`categories-${index}`}
                        control={control}
                        render={({ field }) => (
                          <Multiselect
                            {...field}
                            label="Categories"
                            size="medium"
                            options={categoryOptions}
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
                        name={`collections-${index}`}
                        control={control}
                        render={({ field }) => (
                          <Multiselect
                            {...field}
                            label="Collections"
                            size="medium"
                            options={collectionOptions}
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

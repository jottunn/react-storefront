import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { Box, Button, Multiselect, Text } from "@saleor/macaw-ui";

type SaleFormProps = {
  sale: any;
  onSubmit: (data: FieldValues, saleId: string) => void;
  collectionValues: string[];
  categoryValues: string[];
  collectionOptions: any[];
  categoryOptions: any[];
};

const SaleForm: React.FC<SaleFormProps> = ({
  sale,
  onSubmit,
  collectionValues: initialCollectionValues,
  categoryValues: initialCategoryValues,
  collectionOptions,
  categoryOptions,
}) => {
  const { control, handleSubmit, setValue, reset } = useForm<FieldValues>({
    defaultValues: {
      [`categories-${sale.id}`]: initialCategoryValues,
      [`collections-${sale.id}`]: initialCollectionValues,
    },
  });

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const handleOptionChange = useCallback(
    (selectedCategories: string[], selectedCollections: string[]) => {
      const hasSelectedOptions = selectedCategories.length > 0 || selectedCollections.length > 0;
      setIsSaveDisabled(!hasSelectedOptions);
    },
    []
  );

  // Reset the form when the initial values change (like after a save)
  useEffect(() => {
    reset({
      [`categories-${sale.id}`]: initialCategoryValues,
      [`collections-${sale.id}`]: initialCollectionValues,
    });
  }, [initialCategoryValues, initialCollectionValues, reset, sale.id]);

  return (
    <form key={sale.id} onSubmit={handleSubmit((data) => onSubmit(data, sale.id))}>
      <h3 style={{ marginBottom: "0" }}>Add rules for {sale.name}</h3>
      <div
        className="grid-row"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr",
          gridGap: "20px",
          borderBottom: "1px solid lightblue",
          padding: "20px 0 40px",
        }}
      >
        <input type="hidden" {...control.register(`saleId-${sale.id}`)} value={sale.id} />

        {/* Categories Field */}
        <div>
          <label>
            <Text>Choose Category:</Text>
          </label>
          <Controller
            name={`categories-${sale.id}`}
            control={control}
            defaultValue={initialCategoryValues}
            render={({ field }) => (
              <Multiselect
                {...field}
                label="Categories"
                size="medium"
                options={categoryOptions}
                value={field.value || initialCategoryValues}
                onChange={(selected) => {
                  const selectedValues = selected.map((option: any) => option.value);
                  field.onChange(selectedValues);
                  setValue(`categories-${sale.id}`, selectedValues);
                  // Handle enabling/disabling the button
                  handleOptionChange(selectedValues, field.value || initialCategoryValues);
                }}
              />
            )}
          />
        </div>

        {/* Collections Field */}
        <div>
          <label>
            <Text>Choose Collections</Text>
          </label>
          <Controller
            name={`collections-${sale.id}`}
            control={control}
            defaultValue={initialCollectionValues}
            render={({ field }) => (
              <Multiselect
                {...field}
                label="Collections"
                size="medium"
                options={collectionOptions}
                value={field.value || initialCollectionValues}
                onChange={(selected) => {
                  const selectedValues = selected.map((option: any) => option.value);
                  field.onChange(selectedValues);
                  setValue(`collections-${sale.id}`, selectedValues);
                  // Handle enabling/disabling the button
                  handleOptionChange(field.value || initialCategoryValues, selectedValues);
                }}
              />
            )}
          />
        </div>
        <Box>
          <br />
          <Button type="submit" margin={4} disabled={isSaveDisabled}>
            Save changes for {sale.name}
          </Button>
        </Box>
      </div>
    </form>
  );
};

export default SaleForm;

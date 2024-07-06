import React, { forwardRef, ChangeEvent, useEffect } from "react";
import { type CountryCode } from "saleor/api";
import { countries as allCountries } from "@/lib/consts/countries";
import { Select } from "@/components/Select";
import { Messages } from "@/lib/util";

interface CountrySelectProps {
  only?: CountryCode[];
  value?: CountryCode; // React Hook Form will manage this
  onChange?: (value: CountryCode) => void; // React Hook Form will provide this
  messages: Messages;
}

const countryNames = new Intl.DisplayNames("EN-US", {
  type: "region",
});
export const getCountryName = (countryCode: CountryCode): string =>
  countryNames.of(countryCode) || countryCode;

export const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>(
  ({ only = [], value, onChange, messages }, ref) => {
    const countriesToMap = only.length ? only : allCountries;
    const countryOptions = [
      { value: "", label: messages["app.checkout.countryFieldSelect"] }, // Placeholder option
      ...countriesToMap.map((countryCode) => ({
        value: countryCode,
        label: getCountryName(countryCode),
      })),
    ];

    // Handler for when the selection changes
    const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
      // Call the passed onChange, if it exists, with the new value
      onChange?.(event.target.value as CountryCode);
    };

    useEffect(() => {
      if (only.length === 1 && onChange) {
        // Automatically select the single available country if there's only one option
        onChange(only[0]);
      }
    }, [only, onChange]);

    return (
      <Select
        ref={ref}
        name="countryCode"
        options={countryOptions}
        autoComplete="countryCode"
        onChange={handleCountryChange}
        value={value || ""} // Controlled by React Hook Form, Use an empty string for the unselected state to match the placeholder value
        classNames={{ container: "country-select-container" }}
      />
    );
  },
);

// Set displayName property
CountrySelect.displayName = "CountrySelect";

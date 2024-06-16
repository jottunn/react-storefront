import React, { forwardRef, ChangeEvent } from "react";
import { type CountryCode } from "saleor/api";
import { countries as allCountries } from "@/lib/consts/countries";
import { Select } from "@/components/Select";

interface CountrySelectProps {
  only?: CountryCode[];
  value?: CountryCode; // React Hook Form will manage this
  onChange?: (value: CountryCode) => void; // React Hook Form will provide this
}

const countryNames = new Intl.DisplayNames("EN-US", {
  type: "region",
});
export const getCountryName = (countryCode: CountryCode): string =>
  countryNames.of(countryCode) || countryCode;

export const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>(
  ({ only = [], value, onChange }, ref) => {
    const countriesToMap = only.length ? only : allCountries;
    const countryOptions = [
      { value: "", label: "Select Country" }, // Placeholder option
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

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { AddressDetailsFragment, CheckoutError, CountryCode } from "@/saleor/api";
import { useAvailableShippingCountries } from "@/lib/hooks/useAvailableShippingCountries";
import { Messages } from "@/lib/util";
import { Button } from "@/components/Button/Button";
import { CountrySelect } from "./CountrySelect";
import countiesCitiesData from "@/lib/consts/romania_counties_cities_sorted_unique.json";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export interface AddressFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  country: CountryCode;
  countryArea: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postalCode: string;
}

export interface AddressFormProps {
  existingAddressData?: AddressDetailsFragment;
  toggleEdit: () => void;
  updateAddressMutation: (address: AddressFormData) => Promise<CheckoutError[]>;
  messages: Messages;
  errors?: CheckoutError[];
}

type CountiesCities = {
  [key: string]: {
    name: string;
    iso_code: string;
    cities: string[];
  };
};

const countiesCities: CountiesCities = countiesCitiesData;

export function AddressForm({
  existingAddressData,
  toggleEdit,
  updateAddressMutation,
  messages,
  errors,
}: AddressFormProps) {
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: errorsAddress },
    setError: setErrorAddress,
    control,
    watch,
    resetField,
    setValue,
    unregister,
  } = useForm<AddressFormData>({
    defaultValues: {
      firstName: existingAddressData?.firstName || "",
      lastName: existingAddressData?.lastName || "",
      companyName: existingAddressData?.companyName || "",
      phone: existingAddressData?.phone || "",
      country: (existingAddressData?.country?.code as CountryCode) || "",
      countryArea: existingAddressData?.countryArea || "",
      streetAddress1: existingAddressData?.streetAddress1 || "",
      streetAddress2: existingAddressData?.streetAddress2 || "",
      city: existingAddressData?.city || "",
      postalCode: existingAddressData?.postalCode || "",
    },
  });

  const selectedCountry = watch("country");
  const selectedCounty = watch("countryArea");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (errors && Array.isArray(errors) && errors.length > 0) {
      errors.forEach((e) => {
        setErrorAddress(e.field as keyof AddressFormData, {
          type: "manual",
          message: e.message || "Invalid value",
        });
      });
    }
  }, [errors, setErrorAddress]);

  useEffect(() => {
    if (selectedCounty && selectedCountry === "RO") {
      unregister("city");
      const countyData = countiesCities[selectedCounty];
      if (countyData) {
        setCities(countyData.cities);
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [selectedCounty, selectedCountry]);

  useEffect(() => {
    if (selectedCounty !== existingAddressData?.countryArea) {
      setValue("city", "");
    } else {
      setValue("city", existingAddressData.city);
    }
  }, [selectedCounty, setValue]);

  const onAddressFormSubmit = handleSubmitAddress(async (formData: AddressFormData) => {
    const errors = await updateAddressMutation(formData);
    if (errors && errors.length > 0) {
      errors.forEach((e) =>
        setErrorAddress(e.field as keyof AddressFormData, {
          message: e.message || "Invalid Value",
        }),
      );
      return;
    }

    // Address updated, we can exit the edit mode
    toggleEdit();
  });

  const { availableShippingCountries } = useAvailableShippingCountries();
  return (
    <form method="post" onSubmit={onAddressFormSubmit}>
      <div className="grid grid-cols-12 gap-4 w-full">
        <div className="col-span-full">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.phoneField"]}*
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="phone"
              className="w-full py-2 border-gray-300 rounded-md shadow-sm text-base"
              spellCheck={false}
              {...registerAddress("phone", {
                required: messages["required"],
                pattern: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i,
              })}
            />
            {!!errorsAddress.phone && <p className="text-red-500">{errorsAddress.phone.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.firstNameField"]}*
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="firstName"
              className="block w-full py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("firstName", {
                required: messages["required"],
              })}
            />
            {!!errorsAddress.firstName && (
              <p className="text-red-500">{errorsAddress.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.lastNameField"]}*
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="lastName"
              className="block w-full py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("lastName", {
                required: messages["required"],
              })}
            />
            {!!errorsAddress.lastName && (
              <p className="text-red-500">{errorsAddress.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.companyNameField"]}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="companyName"
              className="block w-full py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("companyName")}
            />
            {!!errorsAddress.companyName && (
              <p className="text-red-500">{errorsAddress.companyName.message}</p>
            )}
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="streetAddress1" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.addressField"]}*
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="streetAddress1"
              className="w-full py-2 border-gray-300 rounded-md shadow-sm text-base"
              spellCheck={false}
              {...registerAddress("streetAddress1", {
                required: messages["required"],
              })}
            />
            {!!errorsAddress.streetAddress1 && (
              <p className="text-red-500">{errorsAddress.streetAddress1.message}</p>
            )}
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="streetAddress2" className="block text-sm font-medium text-gray-700">
            {`${messages["app.checkout.addressField"]}2`}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="streetAddress2"
              className="w-full py-2 border-gray-300 rounded-md shadow-sm text-base"
              spellCheck={false}
              {...registerAddress("streetAddress2")}
            />
            {!!errorsAddress.streetAddress2 && (
              <p className="text-red-500">{errorsAddress.streetAddress2.message}</p>
            )}
          </div>
        </div>
        {/* To ensure that the selected country code from your CountrySelect component gets included in the updateAddressMutation call within your AddressForm component, you need to integrate the CountrySelect component with React Hook Form's useForm mechanism. This integration involves using a controller component or managing the selected value through local state and then passing it to the form handler.
        Since you're using React Hook Form, the most seamless way to integrate custom select components like CountrySelect is by using the Controller component from React Hook Form. This approach will directly link the custom select with the form's state management, ensuring that the selected country code is included in the form data when submitting. */}
        <div className="col-span-full sm:col-span-6">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.countryField"]}*
          </label>
          <Controller
            name="country"
            control={control}
            rules={{ required: messages["app.checkout.countryFieldRequired"] }}
            render={({ field, fieldState: { error } }) => (
              <>
                <CountrySelect only={availableShippingCountries} {...field} messages={messages} />
                {error && <p className="text-red-500">{error.message}</p>}
              </>
            )}
          />
        </div>
        {selectedCountry === "RO" ? (
          <>
            <div className="col-span-full sm:col-span-6">
              <label htmlFor="countryArea" className="block text-sm font-medium text-gray-700">
                {messages["app.checkout.countryAreaField"]}*
              </label>
              <Controller
                name="countryArea"
                control={control}
                rules={{ required: messages["app.checkout.selectCountryAreaField"] }}
                render={({ field, fieldState: { error } }) => (
                  <Listbox value={field.value} onChange={field.onChange}>
                    {({ open }) => (
                      <div className="relative mt-1">
                        <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                          <span className="block truncate">
                            {field.value
                              ? countiesCities[field.value].name
                              : messages["app.checkout.selectCountryAreaField"]}
                          </span>
                          <ChevronDownIcon
                            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-dark/60"
                            aria-hidden="true"
                          />
                        </ListboxButton>

                        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {Object.keys(countiesCities).map((county) => (
                            <ListboxOption
                              key={county}
                              value={county}
                              className={({ focus }) =>
                                `relative cursor-default select-none py-2 pl-2 pr-4 ${focus ? "bg-gray-100 text-action-1" : "text-gray-900"}`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${selected ? "font-medium text-action-1" : "font-normal"}`}
                                  >
                                    {countiesCities[county].name}
                                  </span>
                                </>
                              )}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    )}
                  </Listbox>
                )}
              />
              {!!errorsAddress.countryArea && (
                <p className="text-red-500">{errorsAddress.countryArea.message}</p>
              )}
            </div>

            <div className="col-span-full sm:col-span-6">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                {messages["app.checkout.cityField"]}*
              </label>
              <Controller
                name="city"
                control={control}
                rules={{ required: messages["app.checkout.selectCityField"] }}
                render={({ field, fieldState: { error } }) => (
                  <Listbox value={field.value} onChange={field.onChange}>
                    {({ open }) => (
                      <div className="relative mt-1">
                        <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                          <span className="block truncate">
                            {field.value ? field.value : messages["app.checkout.selectCityField"]}
                          </span>
                          <ChevronDownIcon
                            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-dark/60"
                            aria-hidden="true"
                          />
                        </ListboxButton>

                        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {cities.map((city) => (
                            <ListboxOption
                              key={city}
                              value={city.toUpperCase()}
                              className={({ focus }) =>
                                `relative cursor-default select-none py-2 pl-2 pr-4 ${focus ? "bg-gray-100 text-action-1" : "text-gray-900"}`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${selected ? "font-medium text-action-1" : "font-normal"}`}
                                  >
                                    {city}
                                  </span>
                                </>
                              )}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    )}
                  </Listbox>
                )}
              />
              {!!errorsAddress.city && <p className="text-red-500">{errorsAddress.city.message}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="col-span-full sm:col-span-6">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                {messages["app.checkout.cityField"]}*
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="city"
                  className="block w-full py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  spellCheck={false}
                  {...registerAddress("city", {
                    required: messages["app.checkout.selectCityField"],
                  })}
                />
                {!!errorsAddress.city && (
                  <p className="text-red-500">{errorsAddress.city.message}</p>
                )}
              </div>
            </div>
          </>
        )}
        <div className="col-span-full sm:col-span-6">
          <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
            {messages["app.checkout.postalCodeField"]}*
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="postal-code"
              autoComplete="postal-code"
              className="block w-full py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("postalCode", {
                required: messages["required"],
              })}
            />
            {!!errorsAddress.postalCode && (
              <p className="text-red-500">{messages["app.postalCode.invalid"]}</p>
            )}
          </div>
        </div>
        <div className="col-span-full">
          <Button
            label={messages["app.ui.saveButton"] || "Save"}
            className="btn-checkout-section"
            type="submit"
          />
        </div>
      </div>
    </form>
  );
}

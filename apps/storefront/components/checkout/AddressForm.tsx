import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useIntl } from "react-intl";
import { messages } from "../translations";
import { AddressDetailsFragment, CheckoutError, CountryCode } from "@/saleor/api";

import { CountrySelect } from "./CountrySelect";
import { useAvailableShippingCountries } from "@/lib/hooks/useAvailableShippingCountries";
import { Button } from "../Button";

export interface AddressFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  country: CountryCode;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postalCode: string;
}

export interface AddressFormProps {
  existingAddressData?: AddressDetailsFragment;
  toggleEdit: () => void;
  updateAddressMutation: (address: AddressFormData) => Promise<CheckoutError[]>;
}

export function AddressForm({
  existingAddressData,
  toggleEdit,
  updateAddressMutation,
}: AddressFormProps) {
  const t = useIntl();
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: errorsAddress },
    setError: setErrorAddress,
    control,
  } = useForm<AddressFormData>({
    defaultValues: {
      firstName: existingAddressData?.firstName || "",
      lastName: existingAddressData?.lastName || "",
      companyName: existingAddressData?.companyName || "",
      phone: existingAddressData?.phone || "",
      country: (existingAddressData?.country?.code as CountryCode) || "",
      streetAddress1: existingAddressData?.streetAddress1 || "",
      streetAddress2: existingAddressData?.streetAddress2 || "",
      city: existingAddressData?.city || "",
      postalCode: existingAddressData?.postalCode || "",
    },
  });

  const onAddressFormSubmit = handleSubmitAddress(async (formData: AddressFormData) => {
    const errors = await updateAddressMutation(formData);
    // Assign errors to the form fields
    if (errors.length > 0) {
      errors.forEach((e) =>
        setErrorAddress(e.field as keyof AddressFormData, {
          message: e.message || "",
        })
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
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.phoneField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="phone"
              className="w-full border-gray-300 rounded-md shadow-sm text-base"
              spellCheck={false}
              {...registerAddress("phone", {
                required: true,
                pattern: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i,
              })}
            />
            {!!errorsAddress.phone && <p>{errorsAddress.phone.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.firstNameField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="province"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("firstName", {
                required: true,
              })}
            />
            {!!errorsAddress.firstName && <p>{errorsAddress.firstName.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.lastNameField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="lastName"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("lastName", {
                required: true,
              })}
            />
            {!!errorsAddress.lastName && <p>{errorsAddress.lastName.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.companyNameField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="companyName"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("companyName")}
            />
            {!!errorsAddress.companyName && <p>{errorsAddress.companyName.message}</p>}
          </div>
        </div>

        {/* To ensure that the selected country code from your CountrySelect component gets included in the updateAddressMutation call within your AddressForm component, you need to integrate the CountrySelect component with React Hook Form's useForm mechanism. This integration involves using a controller component or managing the selected value through local state and then passing it to the form handler.
        Since you're using React Hook Form, the most seamless way to integrate custom select components like CountrySelect is by using the Controller component from React Hook Form. This approach will directly link the custom select with the form's state management, ensuring that the selected country code is included in the form data when submitting. */}
        <div className="col-span-full sm:col-span-6">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.countryField)}
          </label>
          <Controller
            name="country"
            control={control} // This comes from useForm
            rules={{ required: "Country selection is required." }}
            render={({ field, fieldState: { error } }) => (
              <>
                <CountrySelect only={availableShippingCountries} {...field} />
                {error && <p className="text-red-500">{error.message}</p>}
              </>
            )}
          />
        </div>

        <div className="col-span-full">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.addressField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="streetAddress1"
              className="w-full border-gray-300 rounded-md shadow-sm text-base"
              spellCheck={false}
              {...registerAddress("streetAddress1", {
                required: true,
              })}
            />
            {!!errorsAddress.streetAddress1 && <p>{errorsAddress.streetAddress1.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.cityField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="city"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("city", { required: true })}
            />
            {!!errorsAddress.city && <p>{errorsAddress.city.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.postalCodeField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="postal-code"
              autoComplete="postal-code"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              spellCheck={false}
              {...registerAddress("postalCode", {
                required: true,
              })}
            />
            {!!errorsAddress.postalCode && <p>{errorsAddress.postalCode.message}</p>}
          </div>
        </div>
        <div className="col-span-full">
          <Button
            label={t.formatMessage(messages.saveButton)}
            className="btn-checkout-section"
            onClick={onAddressFormSubmit}
          />
        </div>
      </div>
    </form>
  );
}

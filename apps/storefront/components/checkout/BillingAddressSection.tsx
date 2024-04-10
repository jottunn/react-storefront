import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { messages } from "../translations";
import { SavedAddressSelectionList } from "@/components";
import {
  CheckoutDetailsFragment,
  CheckoutError,
  CountryCode,
  useCheckoutBillingAddressUpdateMutation,
  useCheckoutShippingAddressUpdateMutation,
} from "@/saleor/api";

import { Button } from "../Button";
import { useRegions } from "../RegionsProvider";
import { AddressDisplay } from "./AddressDisplay";
import { AddressForm, AddressFormData } from "./AddressForm";
import { useUser } from "@/lib/useUser";

export interface BillingAddressSection {
  active: boolean;
  checkout: CheckoutDetailsFragment;
  sameAddress: boolean;
}

export function BillingAddressSection({ active, checkout, sameAddress }: BillingAddressSection) {
  const t = useIntl();
  const { authenticated } = useUser();
  const [editing, setEditing] = useState(!checkout.billingAddress);
  const [checkoutBillingAddressUpdate] = useCheckoutBillingAddressUpdateMutation({});
  const [checkoutShippingAddressUpdate] = useCheckoutShippingAddressUpdateMutation({});
  const { query } = useRegions();

  // useEffect(() => {
  //   if (sameAddress && checkout.billingAddress) {
  //     updateShipping();
  //   }
  // }, [sameAddress])

  useEffect(() => {
    // Automatically update shipping address when "Use same address" is checked and billing address exists.
    if (sameAddress && checkout.billingAddress) {
      // Map checkout.billingAddress to match AddressFormData
      const formData: AddressFormData = {
        firstName: checkout.billingAddress.firstName,
        lastName: checkout.billingAddress.lastName,
        companyName: checkout.billingAddress.companyName || "",
        streetAddress1: checkout.billingAddress.streetAddress1,
        streetAddress2: checkout.billingAddress.streetAddress2 || "",
        city: checkout.billingAddress.city,
        postalCode: checkout.billingAddress.postalCode,
        country: checkout.billingAddress.country.code as CountryCode,
        phone: checkout.billingAddress.phone || "",
      };
      void updateAddress(formData, true);
    }
  }, [sameAddress, checkout.billingAddress]);

  const updateAddress = async (
    formData: AddressFormData,
    updateShipping = false
  ): Promise<CheckoutError[]> => {
    let errors: CheckoutError[] = [];
    const response = await checkoutBillingAddressUpdate({
      variables: { address: { ...formData }, token: checkout.token, locale: query.locale },
    });

    if (response.errors || response.data?.checkoutBillingAddressUpdate?.errors?.length) {
      // Collect GraphQL or business logic errors
      errors = [...(response.data?.checkoutBillingAddressUpdate?.errors ?? [])];
    }

    // If "Use same address" is checked, also update the shipping address
    if (updateShipping && !errors.length) {
      // Only proceed if there were no errors from billing address update
      const shippingResponse = await checkoutShippingAddressUpdate({
        variables: { address: { ...formData }, token: checkout.token, locale: query.locale },
      });

      if (
        shippingResponse.errors ||
        shippingResponse.data?.checkoutShippingAddressUpdate?.errors?.length
      ) {
        // Append any new errors
        errors = [
          ...errors,
          ...(shippingResponse.data?.checkoutShippingAddressUpdate?.errors ?? []),
        ];
      }
    }

    setEditing(false); // Optionally update UI state based on success or error
    return errors; // Return any errors encountered
  };

  // const updateShipping = async () => {
  //   const { data } = await checkoutShippingAddressUpdate({
  //     variables: {
  // address: {
  //   firstName: checkout.billingAddress?.firstName || "",
  //   lastName: checkout.billingAddress?.lastName || "",
  //   companyName: checkout.billingAddress?.companyName || "",
  //   phone: checkout.billingAddress?.phone || "",
  //   country: (checkout.billingAddress?.country.code as CountryCode) || "PL",
  //   streetAddress1: checkout.billingAddress?.streetAddress1 || "",
  //   streetAddress2: checkout.billingAddress?.streetAddress2 || "",
  //   city: checkout.billingAddress?.city || "",
  //   postalCode: checkout.billingAddress?.postalCode || "",
  // },
  //       token: checkout.token,
  //       locale: query.locale,
  //     },
  //   });

  //   const errors = data?.checkoutShippingAddressUpdate?.errors.filter(notNullable) || [];
  //   if (errors.length > 0) {
  //     // Handle or display errors as needed
  //     return errors;
  //   }
  //   return []; // Indicate no errors if successful
  // }

  // const updateMutation = async (formData: AddressFormData) => {
  //   const response = await checkoutBillingAddressUpdate({
  //     variables: {
  //       address: { ...formData },
  //       token: checkout.token,
  //       locale: query.locale,
  //     },
  //   });

  //   // Check for errors in the mutation response
  //   const errors = response.data?.checkoutBillingAddressUpdate?.errors.filter(notNullable) || [];

  //   // Handle errors (e.g., by setting form error state, displaying messages)
  //   if (errors.length > 0) {
  //     // Return errors to be possibly used by the caller
  //     return errors;
  //   }

  //   // If "Use same address" is checked, also update the shipping address
  //   if (sameAddress) {
  //     await updateShippingAddress(formData);
  //   }

  //   // Indicate no errors if successful
  //   setEditing(false); // Or handle UI state updates as needed
  //   return [];
  // };

  // const updateShippingAddress = async (formData: AddressFormData) => {
  //   const response = await checkoutShippingAddressUpdate({
  //     variables: {
  //       address: { ...formData },
  //       token: checkout.token,
  //       locale: query.locale,
  //     },
  //   });

  //   // Check for and handle errors similarly
  //   const errors = response.data?.checkoutShippingAddressUpdate?.errors.filter(notNullable) || [];
  //   if (errors.length > 0) {
  //     // Handle or display errors as needed
  //     return errors;
  //   }
  //   setEditing(false);
  //   return []; // Indicate no errors if successful
  // };

  const handleUpdateMutation = async (formData: AddressFormData): Promise<CheckoutError[]> => {
    // Assuming updateAddress performs the mutation and returns any errors as an array
    const errors = await updateAddress(formData, sameAddress);

    // You might already be handling errors inside updateAddress, in which case you can simply return them here
    return errors;
  };

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {t.formatMessage(messages.billingAddressCardHeader)}
        </h2>
      </div>
      {active &&
        (editing ? (
          <>
            {authenticated && (
              <SavedAddressSelectionList
                updateAddressMutation={handleUpdateMutation}
                // updateAddressMutation={(address: AddressFormData) => updateMutation(address)}
              />
            )}
            <AddressForm
              existingAddressData={checkout.billingAddress || undefined}
              toggleEdit={() => setEditing(false)}
              updateAddressMutation={handleUpdateMutation}
            />
          </>
        ) : (
          <section className="flex justify-between items-center mb-4">
            {!!checkout.billingAddress && <AddressDisplay address={checkout.billingAddress} />}
            <Button
              onClick={() => setEditing(true)}
              label={t.formatMessage(messages.changeButton)}
            />
          </section>
        ))}
    </>
  );
}

export default BillingAddressSection;

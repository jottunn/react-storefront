import React, { useEffect, useState } from "react";
import { CheckoutDetailsFragment, CheckoutError, CountryCode, User } from "@/saleor/api";
import { Button } from "../../Button/Button";
import { Messages } from "@/lib/util";
import { AddressForm, AddressFormData } from "../../account/AddressForm";
import SavedAddressSelectionList from "./SavedAddressSelectionList";
import AddressDisplay from "../../account/AddressDisplay";
import { checkoutBillingAddressUpdate, checkoutShippingAddressUpdate } from "../actions";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface BillingAddressSection {
  active: boolean;
  sameAddress: boolean;
  messages: Messages;
  user: User;
}

function BillingAddressSection({ active, sameAddress, messages, user }: BillingAddressSection) {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout) {
    return;
  }
  const [editing, setEditing] = useState(!checkout.billingAddress);
  const [formErrors, setFormErrors] = useState<CheckoutError[]>([]);

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
        countryArea: checkout.billingAddress.countryArea || "",
        country: checkout.billingAddress.country.code as CountryCode,
        phone: checkout.billingAddress.phone || "",
      };
      void updateAddress(formData, true);
    }
  }, [sameAddress, checkout.billingAddress]);

  const updateAddress = async (
    formData: AddressFormData,
    updateShipping = false,
  ): Promise<CheckoutError[]> => {
    let errors: CheckoutError[] = [];

    const response = await checkoutBillingAddressUpdate({
      address: { ...formData },
      id: checkout.id,
    });
    if (response?.errors) {
      errors = [...(response.errors ?? [])];
    }

    // If "Use same address" is checked, also update the shipping address
    if (checkout.isShippingRequired && updateShipping && !errors.length) {
      // Only proceed if there were no errors from billing address update
      const shippingResponse = await checkoutShippingAddressUpdate({
        address: { ...formData },
        id: checkout.id,
      });

      if (shippingResponse?.errors) {
        // Append any new errors
        errors = [...errors, ...(shippingResponse.errors ?? [])];
      }
    }
    if (!errors.length) {
      setEditing(false);
    }
    setFormErrors(errors); // Set errors to display in the form
    return errors; // Return any errors encountered
  };

  const handleUpdateMutation = async (formData: AddressFormData): Promise<CheckoutError[]> => {
    // Assuming updateAddress performs the mutation and returns any errors as an array
    const errors = await updateAddress(formData, sameAddress);
    await refreshCheckout();
    return errors;
  };

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {messages["app.checkout.billingAddressCardHeader"]}
        </h2>
      </div>
      {active &&
        (editing ? (
          <>
            {user && (
              <SavedAddressSelectionList
                updateAddressMutation={handleUpdateMutation}
                messages={messages}
                user={user}
              />
            )}
            <AddressForm
              existingAddressData={checkout.billingAddress || undefined}
              toggleEdit={() => setEditing(false)}
              updateAddressMutation={handleUpdateMutation}
              errors={formErrors}
              messages={messages}
            />
          </>
        ) : (
          <section className="flex justify-between items-center mb-4">
            {!!checkout.billingAddress && <AddressDisplay address={checkout.billingAddress} />}
            <Button
              onClick={() => setEditing(true)}
              label={messages["app.ui.changeButton"]}
              variant="secondary"
            />
          </section>
        ))}
    </>
  );
}

export default BillingAddressSection;

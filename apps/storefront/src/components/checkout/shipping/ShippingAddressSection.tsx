import React, { useState } from "react";
import { Messages } from "@/lib/util";
import { CheckoutError, User } from "@/saleor/api";
import SavedAddressSelectionList from "../address/SavedAddressSelectionList";
import { Button } from "../../Button";
import AddressDisplay from "../../account/AddressDisplay";
import { AddressForm, AddressFormData } from "../../account/AddressForm";
import { checkoutShippingAddressUpdate } from "../actions";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface ShippingAddressSectionProps {
  active: boolean;
  messages: Messages;
  user: User;
}

function ShippingAddressSection({ active, user, messages }: ShippingAddressSectionProps) {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout) {
    return;
  }
  const [editing, setEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<CheckoutError[]>([]);

  const updateMutation = async (formData: AddressFormData) => {
    let errors: CheckoutError[] = [];
    const shippingResponse = await checkoutShippingAddressUpdate({
      address: { ...formData },
      id: checkout.id,
    });
    if (shippingResponse?.errors) {
      errors = [...(shippingResponse.errors ?? [])];
    }
    if (!errors.length) {
      setEditing(false);
    }
    setFormErrors(errors);
    return errors;
  };

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {messages["app.checkout.shippingAddressCardHeader"]}
        </h2>
      </div>
      {active &&
        (editing ? (
          <>
            {user && (
              <SavedAddressSelectionList
                updateAddressMutation={(address: AddressFormData) => updateMutation(address)}
                messages={messages}
                user={user}
              />
            )}
            <AddressForm
              existingAddressData={checkout.shippingAddress || undefined}
              toggleEdit={() => setEditing(false)}
              updateAddressMutation={updateMutation}
              messages={messages}
              errors={formErrors}
            />
          </>
        ) : (
          <section className="flex justify-between items-center mb-4">
            {!!checkout.shippingAddress && <AddressDisplay address={checkout.shippingAddress} />}
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

export default ShippingAddressSection;

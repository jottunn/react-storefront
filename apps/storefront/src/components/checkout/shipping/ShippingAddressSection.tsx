import React, { useState } from "react";
import { Messages } from "@/lib/util";
import { CheckoutDetailsFragment, User } from "@/saleor/api";
import SavedAddressSelectionList from "../address/SavedAddressSelectionList";
import { Button } from "../../Button";
import AddressDisplay from "../address/AddressDisplay";
import { AddressForm, AddressFormData } from "../address/AddressForm";
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
  const updateMutation = async (formData: AddressFormData) => {
    const shippingResponse = await checkoutShippingAddressUpdate({
      address: { ...formData },
      id: checkout.id,
    });
    setEditing(false);
    return shippingResponse?.errors || [];
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
            {/* <div className="col-span-full pb-4">
              <button type="button" className="btn-checkout-section" onClick={onSameAsBilling}>
                {t.formatMessage(messages.sameAsBillingButton)}
              </button>
            </div> */}
            <AddressForm
              existingAddressData={checkout.shippingAddress || undefined}
              toggleEdit={() => setEditing(false)}
              updateAddressMutation={updateMutation}
              messages={messages}
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

"use client";
import { Button } from "@/components/Button";
import AddressDisplay from "@/components/checkout/address/AddressDisplay";

import { AddressDetailsFragment } from "@/saleor/api";
import { useUserContext } from "../UserContext";
import { deleteAddressMutation, setAddressDefaultMutation } from "src/app/actions";
import { useEffect, useState } from "react";

export interface AddressBookCardProps {
  address: AddressDetailsFragment;
  onAddressChange: (updatedAddress: any) => void;
}

export function AddressBookCard({ address, onAddressChange }: AddressBookCardProps) {
  const { messages } = useUserContext();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  let cardHeader = "";
  if (address.isDefaultShippingAddress && address.isDefaultBillingAddress) {
    cardHeader = messages["app.preferences.addressbook.defaultBillingShipping"];
  } else if (address.isDefaultShippingAddress) {
    cardHeader = messages["app.preferences.addressbook.defaultShipping"];
  } else if (address.isDefaultBillingAddress) {
    cardHeader = messages["app.preferences.addressbook.defaultBilling"];
  }

  const onDeleteAddress = async (addressId: string) => {
    const response = await deleteAddressMutation({ id: addressId });
    if (response?.success) {
      setSuccessMessage(messages["app.preferences.addressbook.success"]);
      onAddressChange(response.addresses);
    } else {
      setError(messages[response?.errors[0]?.code] || response?.errors[0]?.code);
    }
  };

  const setDefaultAddress = async (addressId: string, type: string) => {
    const response = await setAddressDefaultMutation({ id: addressId, type: type });
    if (response?.success) {
      setSuccessMessage(messages["app.preferences.addressbook.success"]);
      onAddressChange(response.addresses);
    } else {
      setError(messages[response?.errors[0]?.code] || response?.errors[0]?.code);
    }
  };

  return (
    <div className="justify-between flex flex-col checkout-section-container md:mx-2 mb-2">
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-action-1 text-md">{successMessage}</p>}
      {!!cardHeader && <p className="text-md font-semibold mb-1">{cardHeader}</p>}
      <AddressDisplay address={address} />
      {!address.isDefaultBillingAddress && (
        <Button
          className="my-1"
          onClick={() => setDefaultAddress(address.id, "BILLING")}
          label={messages["app.preferences.addressbook.setDefaultBilling"]}
        />
      )}
      {!address.isDefaultShippingAddress && (
        <Button
          className="my-1"
          onClick={() => setDefaultAddress(address.id, "SHIPPING")}
          label={messages["app.preferences.addressbook.setDefaultShipping"]}
        />
      )}
      <Button
        className="my-1 mt-4 hover:bg-red-700"
        variant="secondary"
        onClick={() => onDeleteAddress(address.id)}
        label={messages["app.ui.removeButton"]}
      />
    </div>
  );
}

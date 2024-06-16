"use client";
import { Button } from "@/components/Button";
import AddressDisplay from "@/components/checkout/address/AddressDisplay";

import { AddressDetailsFragment } from "@/saleor/api";
import { useUserContext } from "../UserContext";
import { deleteAddressMutation, setAddressDefaultMutation } from "src/app/actions";

export interface AddressBookCardProps {
  address: AddressDetailsFragment;
}

export function AddressBookCard({ address }: AddressBookCardProps) {
  const { messages } = useUserContext();
  let cardHeader = "";
  if (address.isDefaultShippingAddress && address.isDefaultBillingAddress) {
    cardHeader = messages["app.preferences.addressbook.defaultBillingShipping"];
  } else if (address.isDefaultShippingAddress) {
    cardHeader = messages["app.preferences.addressbook.defaultShipping"];
  } else if (address.isDefaultBillingAddress) {
    cardHeader = messages["app.preferences.addressbook.defaultBilling"];
  }

  const onDeleteAddress = async (addressId: string) => {
    await deleteAddressMutation({ id: addressId });
  };

  const setDefaultAddress = async (addressId: string, type: string) => {
    await setAddressDefaultMutation({ id: addressId, type: type });
  };

  return (
    <div className="justify-between flex flex-col checkout-section-container md:mx-2 mb-2">
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

"use client";
import { Button } from "@/components/Button/Button";
import AddressDisplay from "@/components/account/AddressDisplay";
import { AddressDetailsFragment } from "@/saleor/api";
import {
  deleteAddressMutation,
  setAddressDefaultMutation,
  updateAddressMutation,
} from "src/app/actions";
import { useState } from "react";
import { AddressForm, AddressFormData } from "@/components/account/AddressForm";
import { Messages } from "@/lib/util";

export interface AddressBookCardProps {
  address: AddressDetailsFragment;
  onAddressChange: (updatedAddress: any) => void;
  messages: Messages;
}

export function AddressBookCard({ address, onAddressChange, messages }: AddressBookCardProps) {
  const [error, setError] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // console.log('address', address);

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

  const handleUpdateMutation = async (formData: AddressFormData): Promise<any[]> => {
    const response = await updateAddressMutation({ id: address.id, address: formData });
    if (response?.success) {
      setSuccessMessage(messages["app.preferences.addressbook.success"]);
      setEditing(false);
      onAddressChange(response.addresses);
      return [];
    } else {
      //response?.errors && response?.errors[0]?.code && setError(messages[response?.errors[0]?.code]);
      return response?.errors as any;
    }
  };

  return (
    <div className="flex-1 min-w-[200px] md:min-w-[300px] md:w-1/2 md:ml-2 mb-2 relative">
      <div className="border p-4 md:min-h-[250px]">
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-action-1 text-md">{successMessage}</p>}
        {!!cardHeader && <p className="text-md font-semibold mb-1 mr-8">{cardHeader}</p>}
        <AddressDisplay address={address} />
        <button
          type="button"
          className=" absolute right-4 top-1 text-md font-medium text-white-600 hover:text-main-1 sm:ml-0 sm:mt-3"
          onClick={() => setEditing(!editing)}
          title={messages["app.ui.changeButton"]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        {editing && (
          <>
            <div className="mt-6">
              <AddressForm
                existingAddressData={address}
                toggleEdit={() => setEditing(false)}
                updateAddressMutation={handleUpdateMutation}
                errors={error}
                messages={messages}
              />
            </div>
          </>
        )}
        <div className="my-4">
          {!address.isDefaultBillingAddress && (
            <Button
              variant="secondary"
              className="my-1 mr-2 py-2 w-auto inline-flex h-auto items-center justify-center whitespace-break-spaces"
              onClick={() => setDefaultAddress(address.id, "BILLING")}
              label={messages["app.preferences.addressbook.setDefaultBilling"]}
            />
          )}
          {!address.isDefaultShippingAddress && (
            <Button
              variant="secondary"
              className="my-1 py-2 w-auto inline-flex h-auto items-center justify-center whitespace-break-spaces"
              onClick={() => setDefaultAddress(address.id, "SHIPPING")}
              label={messages["app.preferences.addressbook.setDefaultShipping"]}
            />
          )}
        </div>
        <button
          type="button"
          className="text-md font-medium text-white-600 hover:text-red-500 sm:ml-0 mt-4"
          onClick={() => onDeleteAddress(address.id)}
          title={messages["app.ui.removeButton"]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

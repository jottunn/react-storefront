import clsx from "clsx";
import React from "react";
import { AddressDetailsFragment, CheckoutError, CountryCode, User } from "@/saleor/api";
import { AddressFormData } from "../../account/AddressForm";
import Spinner from "@/components/Spinner";
import { Messages } from "@/lib/util";

interface SavedAddressSelectionListProps {
  updateAddressMutation: (address: AddressFormData) => Promise<CheckoutError[]>;
  messages: Messages;
  user: User;
}

export function SavedAddressSelectionList({
  updateAddressMutation,
  messages,
  user,
}: SavedAddressSelectionListProps) {
  const [selectedSavedAddress, setSelectedSavedAddress] =
    React.useState<AddressDetailsFragment | null>();

  const addresses = user?.addresses || [];

  if (addresses.length === 0) return null;

  const onSelectSavedAddress = async (address: AddressDetailsFragment) => {
    setSelectedSavedAddress(address);

    // @todo handle errors
    const _errors = await updateAddressMutation({
      firstName: address?.firstName,
      lastName: address?.lastName,
      phone: address?.phone || "",
      country: address?.country?.code as CountryCode,
      companyName: address?.companyName,
      streetAddress1: address.streetAddress1,
      streetAddress2: address.streetAddress2 || "",
      city: address.city,
      postalCode: address.postalCode,
    });
  };

  return (
    <>
      {addresses.length > 0 && (
        <p className="mb-2 text-base">{messages["app.checkout.addressSelect"]}</p>
      )}
      <div className="grid grid-cols-2 mb-2">
        {addresses.map((address) => (
          <div
            role="radio"
            aria-checked={address?.id === selectedSavedAddress?.id}
            tabIndex={-1}
            onClick={() => address && onSelectSavedAddress(address)}
            onKeyDown={(e) => {
              if (address && e.key === "Enter") {
                return onSelectSavedAddress(address);
              }
            }}
            className={clsx(
              "border-2 p-3 mr-2 rounded-md cursor-pointer hover:border-action-3",
              address?.id === selectedSavedAddress?.id && "border-action-1",
            )}
            key={address?.id}
          >
            <p>{`${address?.firstName} ${address?.lastName}`}</p>
            <p className="text-gray-600 text-sm">{address?.streetAddress1}</p>
            <p className="text-gray-600 text-sm">
              {`${address?.postalCode} ${address?.city}, ${address?.country.country}`}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default SavedAddressSelectionList;

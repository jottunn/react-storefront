"use client";
import React, { useState } from "react";
import { AddressBookCard } from "./AddressBookCard";
import { User } from "@/saleor/api";
import { Messages } from "@/lib/util";

interface AddressesClientProps {
  user: User;
  messages: Messages;
}

function AddressesClient({ user, messages }: AddressesClientProps) {
  const [addresses, setAddresses] = useState(user?.addresses || []);

  const handleAddressChange = (updatedAddress: any) => {
    if (Array.isArray(updatedAddress)) {
      setAddresses([...updatedAddress]);
    } else {
      setAddresses((prevAddresses) =>
        prevAddresses.map((address) =>
          address.id === updatedAddress.id ? updatedAddress : address,
        ),
      );
    }
  };

  return (
    <div className="mx-6 my-6 md:mx-0 md:my-0 md:flex md:flex-wrap md:gap-2">
      {user &&
        addresses.map((address) => (
          <AddressBookCard
            key={address.id}
            address={address}
            onAddressChange={handleAddressChange}
            messages={messages}
          />
        ))}
    </div>
  );
}

export default AddressesClient;

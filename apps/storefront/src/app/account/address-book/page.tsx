"use client";

import React, { useState } from "react";
import { useUserContext } from "../UserContext";
import { AddressBookCard } from "./AddressBookCard";

function AddressBookPage() {
  const { user } = useUserContext();
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
    <div className="flex flex-col md:flex-row">
      {user &&
        addresses.map((address) => (
          <AddressBookCard
            key={address.id}
            address={address}
            onAddressChange={handleAddressChange}
          />
        ))}
    </div>
  );
}

export default AddressBookPage;

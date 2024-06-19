"use client";

import React, { useState } from "react";
import { useUserContext } from "../UserContext";
import { AddressBookCard } from "./AddressBookCard";

function AddressBookPage() {
  const { user } = useUserContext();
  const [addresses, setAddresses] = useState(user?.addresses || []);

  const handleAddressChange = (updatedAddress: any) => {
    setAddresses([...updatedAddress]);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
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

"use client";

import React from "react";
import { useUserContext } from "../UserContext";
import { AddressBookCard } from "./AddressBookCard";

function AddressBookPage() {
  const { user } = useUserContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {user &&
        user.addresses.map((address) => <AddressBookCard key={address.id} address={address} />)}
    </div>
  );
}

export default AddressBookPage;

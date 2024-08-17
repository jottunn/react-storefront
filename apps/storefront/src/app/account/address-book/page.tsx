import React from "react";
import { User } from "@/saleor/api";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import AddressesClient from "./AddressesClient";
import { getCurrentUser } from "src/app/actions";
import LoginForm from "src/app/login/LoginForm";
const messages = getMessages(DEFAULT_LOCALE);
export const dynamic = "force-dynamic";

async function AddressBookPage() {
  const user = await getCurrentUser();
  if (!user || user === null) {
    return (
      <div className="w-[85%] md:w-[35%]">
        <LoginForm messages={messages} />
      </div>
    );
  }

  return (
    <div className="mx-6 my-6 md:mx-0 md:my-0 md:flex md:flex-wrap md:gap-2">
      <AddressesClient messages={messages} user={user as User} />
    </div>
  );
}

export default AddressBookPage;

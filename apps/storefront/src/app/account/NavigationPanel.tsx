import { Messages } from "@/lib/util";
import Link from "next/link";
import React from "react";

type NavProps = {
  messages: Messages;
};

export function NavigationPanel({ messages }: NavProps) {
  const linkClassname =
    "flex text-base p-4 items-center w-full rounded-md shadow-sm h-10 hover:text-brand border-b";
  return (
    <div className="group w-full md:w-4/5 cursor-default rounded-md bg-white">
      <Link href="/account/" className="text-black">
        <span className={linkClassname}>{messages["app.preferences.profile"]}</span>
      </Link>
      <Link href="/account/address-book/" className="text-black">
        <span className={linkClassname}>{messages["app.preferences.navigation.addressBook"]}</span>
      </Link>
      <Link href="/account/orders/" className="text-black">
        <span className={linkClassname}>{messages["app.preferences.navigation.orders"]}</span>
      </Link>
    </div>
  );
}

export default NavigationPanel;

"use client";

import { Messages } from "@/lib/util";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavProps = {
  messages: Messages;
};

export function NavigationPanel({ messages }: NavProps) {
  const pathname = usePathname();
  const linkClassname = "text-base uppercase font-semibold  hover:text-action-1";
  const wrapLinkClassName =
    "text-black block w-full text-center border-r md:border-r-0 md:text-left px-4 py-4 md:px-0";
  return (
    <div className="flex flex-row md:flex-col justify-around items-center bg-main-5 md:bg-white md:group md:w-4/5 border-b rounded-md shadow-sm">
      <Link href="/account" className={wrapLinkClassName}>
        <span className={clsx(linkClassname, pathname === "/account" && "text-action-1")}>
          {messages["app.preferences.profile"]}
        </span>
      </Link>
      <Link href="/account/address-book" className={wrapLinkClassName}>
        <span
          className={clsx(linkClassname, pathname === "/account/address-book" && "text-action-1")}
        >
          {messages["app.preferences.navigation.addressBook"]}
        </span>
      </Link>
      <Link href="/account/orders" className={wrapLinkClassName}>
        <span className={clsx(linkClassname, pathname === "/account/orders" && "text-action-1")}>
          {messages["app.preferences.navigation.orders"]}
        </span>
      </Link>
    </div>
  );
}

export default NavigationPanel;

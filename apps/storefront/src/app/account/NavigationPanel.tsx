"use client";

import { useUser } from "@/lib/hooks/useUser";
import { Messages } from "@/lib/util";
import { PowerIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { logout } from "src/app/actions";

type NavProps = {
  messages: Messages;
};

export function NavigationPanel({ messages }: NavProps) {
  const pathname = usePathname();
  const linkClassname = "text-base uppercase font-semibold hover:text-action-1";
  const wrapLinkClassName =
    "text-black block w-full text-center border-r md:border-r-0 md:text-left px-4 py-4 md:px-0";
  const router = useRouter();
  const user = useUser();
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  return (
    <div className="flex flex-row md:flex-col justify-around items-center bg-main-5 md:bg-white md:group md:w-4/5">
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
      {user && (
        <button
          type="button"
          onClick={handleLogout}
          className={clsx(wrapLinkClassName, linkClassname, " hover:text-red-500 hidden md:flex")}
        >
          <span>{messages["app.navigation.logout"]}</span>
          <PowerIcon className="h-5 w-5 ml-2" />
        </button>
      )}
    </div>
  );
}

export default NavigationPanel;

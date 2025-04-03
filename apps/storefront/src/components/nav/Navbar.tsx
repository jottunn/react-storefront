import clsx from "clsx";
import Link from "next/link";
import React, { Suspense } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";
import MobileMenu from "./components/MobileMenu/MobileMenu";
import Menu from "./Menu";
import CustomSearchBox from "./components/Search/SearchBox";
import CartNavItem from "../cart/CartNavItem";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import UserMenu from "./components/UserMenu/UserMenu";
import IconWithPopover from "../IconWithPopover";
const messages = getMessages(DEFAULT_LOCALE, "app.navigation");

export const Navbar = async () => {
  return (
    <>
      <div className={clsx(styles.navbar)}>
        <div className="container w-full flex md:grid md:grid-cols-3 md:justfy-center py-4 lg:pb-0 items-center">
          <div></div>
          <Link href="/">
            <Image
              src="/logosurmont.png"
              alt="Surmont - The bike shop logo"
              width={300}
              height={100}
              className="md:h-[65px] w-[200px] md:w-auto"
              style={{ margin: "auto" }}
              priority={true}
            />
          </Link>
          <div className="ml-auto flex items-center justify-center gap-4 whitespace-nowrap lg:gap-6 mt-[-10px] md:mt-0">
            <div className="hidden md:flex">
              <CustomSearchBox />
            </div>
            <UserMenu messages={messages} />
            <Suspense fallback={<div className="w-6" />}>
              <CartNavItem />
            </Suspense>
            <IconWithPopover />
            <MobileMenu />
          </div>
        </div>
        <div className={clsx(styles.inner)}>
          <div className="md:flex-1 md:h-full">
            <Menu />
          </div>
        </div>
      </div>
    </>
  );
};

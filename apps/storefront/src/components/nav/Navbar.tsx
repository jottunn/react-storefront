import clsx from "clsx";
import Link from "next/link";
import React, { Suspense } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";
import UserMenuContainer from "./components/UserMenu/UserMenuContainer";
import MobileMenu from "./components/MobileMenu/MobileMenu";
import Menu from "./Menu";
import CustomSearchBox from "./SearchBox";
import CartNavItem from "../cart/CartNavItem";

export const Navbar = async () => {
  return (
    <>
      <div className={clsx(styles.navbar)}>
        <div className="container w-full flex py-4 lg:pb-0 items-center	">
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo-surmont.png"
              alt="Surmont - The bike shop logo"
              width="200"
              height="31"
              priority={true}
            />
          </Link>
          <div className="ml-auto flex items-center justify-center gap-4 whitespace-nowrap lg:gap-6">
            <div className="hidden md:flex">
              <CustomSearchBox />
            </div>
            <Suspense fallback={<div className="w-8" />}>
              {/* @ts-expect-error Async Server Component */}
              <UserMenuContainer />
            </Suspense>
            <Suspense fallback={<div className="w-6" />}>
              <CartNavItem />
            </Suspense>
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

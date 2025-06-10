import Link from "next/link";
import React, { Suspense } from "react";
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
    <header className="bg-white text-main sticky top-0 z-50 border-b border-b-2 border-main-6">
      <div className="container w-full flex md:grid md:grid-cols-3 md:justify-center py-4 lg:pb-0 items-center">
        <div aria-hidden="true"></div>
        <Link href="/" aria-label="Go to homepage">
          <Image
            src="/logosurmont.png"
            alt="Surmont - The bike shop logo"
            width={300}
            height={100}
            className="md:h-[65px] w-[200px] md:w-auto"
            style={{ margin: "auto" }}
            priority={true}
            fetchPriority="high"
            loading="eager"
          />
        </Link>
        <nav
          className="ml-auto flex items-center justify-center gap-4 whitespace-nowrap lg:gap-6 mt-[-10px] md:mt-0"
          aria-label="Main navigation"
        >
          <div className="hidden md:flex">
            <CustomSearchBox />
          </div>
          <UserMenu messages={messages} />
          <Suspense fallback={<div className="w-6" aria-hidden="true" />}>
            <CartNavItem />
          </Suspense>
          <IconWithPopover />
          <MobileMenu />
        </nav>
      </div>
      <div className="container h-12 flex-nowrap items-center hidden lg:flex pl-0 pr-0">
        <div className="md:flex-1 md:h-full">
          <Menu />
        </div>
      </div>
    </header>
  );
};

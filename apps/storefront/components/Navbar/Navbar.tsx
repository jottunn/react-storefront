import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { memo, useEffect, useState } from "react";
import { usePaths } from "@/lib/paths";
import { BurgerMenu } from "../BurgerMenu";
import { Menu } from "./Menu";
import styles from "./Navbar.module.css";
import UserMenu from "./UserMenu";
import { useUser } from "@/lib/useUser";
import Image from "next/image";
import CartModal from "../cart/CartModal";
import { SearchBar } from "./SearchBar";
import { UserIcon, Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import Search from "../Search/searchBox";

export function Navbar() {
  const paths = usePaths();
  const router = useRouter();
  const [isBurgerOpen, setBurgerOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { authenticated: actuallyAuthenticated } = useUser();

  // Avoid hydration warning by setting authenticated state in useEffect
  useEffect(() => {
    setAuthenticated(actuallyAuthenticated);
  }, [actuallyAuthenticated]);

  useEffect(() => {
    // Close side menu after changing the page
    router.events.on("routeChangeStart", () => {
      if (isBurgerOpen) {
        setBurgerOpen(false);
      }
    });
  });

  return (
    <>
      <div className={clsx(styles.navbar)}>
        <div className="container w-full flex py-4 md:pb-0 items-center	">
          <Link href={paths.$url()} className={styles.logo}>
            <Image
              src="/logo-surmont.png"
              alt="Surmont - The bike shop logo"
              className="pl-4"
              width="200"
              height="31"
              priority={true}
            />
          </Link>
          <div className="ml-auto flex items-center justify-center gap-4 whitespace-nowrap lg:gap-6 pr-4">
            <div className="hidden md:flex">
              {/* <SearchBar /> */}
              <Search />
            </div>
            {!authenticated ? (
              <Link href={paths.account.login.$url()} data-testid="userIcon">
                <UserIcon className={styles["nav-icon-button"]} />
              </Link>
            ) : (
              <UserMenu />
            )}

            {router.route !== "/checkout" && <CartModal />}

            <Bars3BottomLeftIcon
              className="ml-2 lg:hidden w-8 h-8 cursor-pointer ml-2"
              onClick={() => setBurgerOpen(true)}
              aria-label="Open Menu"
            />
          </div>
        </div>
        <div className={clsx(styles.inner)}>
          <div className="md:flex-1 md:h-full">
            <Menu />
          </div>
        </div>
      </div>
      <BurgerMenu open={isBurgerOpen} onCloseClick={() => setBurgerOpen(false)} />
    </>
  );
}

export default memo(Navbar);

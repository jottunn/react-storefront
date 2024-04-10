import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePaths } from "@/lib/paths";
import { BurgerMenu } from "../BurgerMenu";
import { Menu } from "./Menu";
import styles from "./Navbar.module.css";
import NavIconButton from "./NavIconButton";
import UserMenu from "./UserMenu";
import { useUser } from "@/lib/useUser";
import Image from "next/image";
import CartModal from "../cart/CartModal";
import { SearchBar } from "./SearchBar";

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
          <Link href={paths.$url()} passHref legacyBehavior>
            <a href="pass" className={styles.logo}>
              <Image
                src="/logo-surmont.png"
                alt="Surmont - The bike shop logo"
                className="pl-4"
                width="200"
                height="31"
                priority={true}
              />
            </a>
          </Link>
          <div className="ml-auto flex items-center justify-center gap-4 whitespace-nowrap lg:gap-6">
            <div className="hidden md:flex">
              <SearchBar />
            </div>
            {!authenticated ? (
              <Link href={paths.account.login.$url()} passHref legacyBehavior>
                <a href="pass" data-testid="userIcon">
                  <NavIconButton isButton={false} icon="user" aria-hidden="true" />
                </a>
              </Link>
            ) : (
              <UserMenu />
            )}

            {router.route !== "/checkout" && <CartModal />}

            {/* <Link href={paths.search.$url()} passHref legacyBehavior>
              <a href="pass" className="hidden lg:flex ml-2" data-testid="searchIcon">
                <NavIconButton isButton={false} icon="spyglass" />
              </a>
            </Link> */}
            <NavIconButton
              icon="menu"
              className="ml-2 lg:hidden"
              onClick={() => setBurgerOpen(true)}
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

export default Navbar;

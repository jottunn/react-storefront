"use client";

import clsx from "clsx";
import styles from "./BurgerMenu.module.css";
import { CollapseMenu } from "./CollapseMenu";
import { XMarkIcon, Bars3BottomLeftIcon, PowerIcon } from "@heroicons/react/24/solid";
import { useMobileMenu } from "./useMobileMenu";
import { MenuGetBySlugQuery, User } from "@/saleor/api";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "src/app/actions";
import { useUser } from "@/lib/hooks/useUser";

interface ClientMobileMenuProps {
  leftNavLinks: MenuGetBySlugQuery;
  rightNavLinks: MenuGetBySlugQuery;
  children: ReactNode;
}

export default function MobileMenuClient({
  leftNavLinks,
  rightNavLinks,
  children,
}: ClientMobileMenuProps) {
  const { closeMenu, openMenu, isOpen } = useMobileMenu();
  const router = useRouter();
  const user = useUser();
  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new Event("user-logout"));
    router.push("/login");
  };

  return (
    <>
      <Bars3BottomLeftIcon
        className="ml-2 lg:hidden w-8 h-8 cursor-pointer ml-2"
        onClick={openMenu}
        aria-label="Open Menu"
      />
      <div
        className={clsx(styles.container, {
          [styles["container--open"]]: isOpen,
        })}
      >
        <div className={styles.backdrop} aria-hidden="true" onClick={closeMenu} />
        <div className={styles.body}>
          <div className="flex justify-start w-full mb-5">
            <XMarkIcon onClick={closeMenu} className="w-8 h-8 cursor-pointer" />
          </div>
          {leftNavLinks.menu?.items?.map((item) => <CollapseMenu menuItem={item} key={item.id} />)}
          {rightNavLinks.menu?.items?.map((item) => <CollapseMenu menuItem={item} key={item.id} />)}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-red-500 flex mt-6 pt-6 text-md uppercase font-semibold border-t-2"
            >
              <PowerIcon className="h-6 w-6 mr-2" />
              <span>Logout</span>
            </button>
          )}
          <div className="mt-auto pt-4">{children}</div>
        </div>
      </div>
    </>
  );
}

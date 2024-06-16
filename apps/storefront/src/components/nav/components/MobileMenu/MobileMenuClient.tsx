"use client";

import clsx from "clsx";
import styles from "./BurgerMenu.module.css";
import { CollapseMenu } from "./CollapseMenu";
import { XMarkIcon, Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { useMobileMenu } from "../../useMobileMenu";
import { MenuGetBySlugQuery } from "@/saleor/api";
import { ReactNode } from "react";

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
          <div className="mt-auto pt-4">{children}</div>
        </div>
      </div>
    </>
  );
}

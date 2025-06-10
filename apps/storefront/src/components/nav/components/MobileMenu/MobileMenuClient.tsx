"use client";

import clsx from "clsx";
import { CollapseMenu } from "./CollapseMenu";
import { XMarkIcon, Bars3BottomLeftIcon, PowerIcon } from "@heroicons/react/24/solid";
import { useMobileMenu } from "./useMobileMenu";
import { MenuGetBySlugQuery, User } from "@/saleor/api";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "src/app/actions";

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
  const [user, setUser] = useState<User | null>(null);
  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new Event("user-logout"));
    router.push("/login");
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    fetchCurrentUser();
  }, [isOpen]);

  return (
    <>
      <Bars3BottomLeftIcon
        className="ml-2 lg:hidden w-8 h-8 cursor-pointer ml-2"
        onClick={openMenu}
        aria-label="Open Menu"
      />
      <div
        className={clsx(
          "fixed top-0 right-0 w-full h-full z-50 flex justify-end transition-all duration-150",
          {
            "opacity-100": isOpen,
            "opacity-0 pointer-events-none": !isOpen,
          },
        )}
      >
        <div
          className="absolute z-0 top-0 right-0 w-full h-full bg-[rgba(57,64,82,0.6)]"
          aria-hidden="true"
          onClick={closeMenu}
        />
        <div className="relative z-10 bg-white h-full overflow-y-scroll py-6 px-7 flex flex-col w-[93.846153846153846%] max-w-[366px]">
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

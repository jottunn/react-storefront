"use client";

import clsx from "clsx";
import Link from "next/link";
import { logout } from "src/app/actions";
import styles from "../../Navbar.module.css";
import { UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  messages: { [key: string]: string };
}

export function UserMenu({ messages }: UserMenuProps) {
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  return (
    <div className={clsx(styles["user-menu-container"])}>
      <UserIcon className={styles["nav-icon-button"]} />
      <div className={styles["user-menu"]}>
        <Link href="/account" tabIndex={0} className={styles["user-menu-item"]}>
          {messages["app.navigation.accountPreferences"]}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          tabIndex={-1}
          className={styles["user-menu-item"]}
        >
          {messages["app.navigation.logout"]}
        </button>
      </div>
    </div>
  );
}

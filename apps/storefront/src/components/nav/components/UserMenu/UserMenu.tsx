"use client";
import { useUser } from "@/lib/hooks/useUser";
import { UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import styles from "../../Navbar.module.css";
import { Messages } from "@/lib/util";

interface UserMenuProps {
  messages: Messages;
}

export default function UserMenu({ messages }: UserMenuProps) {
  const user = useUser();
  return (
    <Link
      href={user ? "/account" : "/login"}
      data-testid="userIcon"
      title={messages["app.navigation.accountPreferences"]}
    >
      <UserIcon className={styles["nav-icon-button"]} />
    </Link>
  );
}

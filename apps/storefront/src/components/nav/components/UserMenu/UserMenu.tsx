"use client";
import { useUser } from "@/lib/hooks/useUser";
import { UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Messages } from "@/lib/util";

interface UserMenuProps {
  messages: Messages;
  display?: string;
}

export default function UserMenu({ messages, display }: UserMenuProps) {
  const user = useUser();
  //console.log("UserMenu re-rendered with user:", user); // Log the user state
  return (
    <Link
      href={user ? "/account" : "/login"}
      data-testid="userIcon"
      title={messages["app.navigation.accountPreferences"]}
    >
      {display && display === "footer" ? (
        <span className="text-base cursor-pointer hover:underline leading-[2rem]">Login</span>
      ) : (
        <UserIcon className="relative hover:text-brand w-6 h-6 flex justify-center items-center" />
      )}
    </Link>
  );
}

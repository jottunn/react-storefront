"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: JSX.Element | string;
}) {
  const pathname = usePathname();
  const isActive = pathname === `${href}/`;
  return (
    <Link
      href={href}
      className={clsx(
        isActive ? "border-neutral-200 text-action-1" : "border-transparent text-neutral-900",
        "inline-flex items-center border-b pt-px text-[1.5rem] leading-[3.4rem] font-medium hover:text-action-1",
      )}
    >
      {children}
    </Link>
  );
}

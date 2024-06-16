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
  className: string;
  children: JSX.Element | string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

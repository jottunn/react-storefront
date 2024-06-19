"use client";
import Link from "next/link";
import { getLinkPath } from "src/lib/menus";
import { translate } from "src/lib/translations";
import { MenuItemWithChildrenFragment } from "@/saleor/api";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavigationAnchorProps {
  menuItem: MenuItemWithChildrenFragment;
  className: string;
}

export function NavigationAnchor({ menuItem, className }: NavigationAnchorProps) {
  const pathname = usePathname();
  const href = menuItem.url || getLinkPath(menuItem);
  const isActive = pathname === `${href}/`;

  return (
    <Link
      href={href}
      className={clsx(className, isActive && "text-action-1")}
      data-testid={`categoriesList${menuItem.name}`}
    >
      {translate(menuItem, "name")}
    </Link>
  );
}

export default NavigationAnchor;

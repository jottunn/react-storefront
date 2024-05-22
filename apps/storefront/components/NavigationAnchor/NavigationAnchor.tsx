import Link from "next/link";

import { getLinkPath } from "@/lib/menus";
import { translate } from "@/lib/translations";
import { MenuItemWithChildrenFragment } from "@/saleor/api";

interface NavigationAnchorProps {
  menuItem: MenuItemWithChildrenFragment;
  className: string;
}

export function NavigationAnchor({ menuItem, className }: NavigationAnchorProps) {
  if (menuItem.url) {
    return (
      <a
        href={menuItem.url}
        rel="noreferrer"
        className={className}
        data-testid={`categoriesList${menuItem.name}`}
      >
        {translate(menuItem, "name")}
      </a>
    );
  }

  return (
    <Link
      href={getLinkPath(menuItem)}
      className={className}
      data-testid={`categoriesList${menuItem.name}`}
    >
      {translate(menuItem, "name")}
    </Link>
  );
}

export default NavigationAnchor;

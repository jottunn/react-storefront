import Link from "next/link";
import { getLinkPath } from "src/lib/menus";
import { translate } from "src/lib/translations";
import { MenuItemWithChildrenFragment } from "@/saleor/api";

interface NavigationAnchorProps {
  menuItem: MenuItemWithChildrenFragment;
  className: string;
}

export function NavigationAnchor({ menuItem, className }: NavigationAnchorProps) {
  return (
    <Link
      href={menuItem.url || getLinkPath(menuItem)}
      className={className}
      data-testid={`categoriesList${menuItem.name}`}
    >
      {translate(menuItem, "name")}
    </Link>
  );
}

export default NavigationAnchor;

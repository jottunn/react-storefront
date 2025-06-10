"use client";

import clsx from "clsx";
import { useState } from "react";
import { translate } from "src/lib/translations";
import { MenuItemWithChildrenFragment } from "@/saleor/api";
import SubCollapseMenu from "./SubCollapseMenu";
import NavigationAnchor from "./NavigationAnchor";

export interface CollapseMenuProps {
  menuItem: MenuItemWithChildrenFragment;
}

export function CollapseMenu({ menuItem }: CollapseMenuProps) {
  const [open, setOpen] = useState(false);

  const shouldDisplayAnchor = !menuItem.children?.length;

  return (
    <div className="collapsem">
      {shouldDisplayAnchor ? (
        <NavigationAnchor
          menuItem={menuItem}
          className="text-main uppercase text-md leading-[1.2em] font-medium flex justify-between	items-center w-full text-left"
        />
      ) : (
        <>
          <button
            type="button"
            className={clsx(
              "text-main uppercase text-md leading-[1.2em] font-medium flex justify-between	items-center w-full text-left",
              {
                "text-brand mb-4 pb-4 border-b border-main-4": open,
              },
            )}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {translate(menuItem, "name")}
            <span
              className={clsx(
                "inline-flex ml-auto transition-transform duration-300 ease-in-out text-lg font-medium text-gray-500",
                { "rotate-45": open },
              )}
              aria-hidden="true"
            >
              +
            </span>
          </button>
          {open && (
            <div>
              {menuItem.children?.map((item) => <SubCollapseMenu menuItem={item} key={item.id} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CollapseMenu;

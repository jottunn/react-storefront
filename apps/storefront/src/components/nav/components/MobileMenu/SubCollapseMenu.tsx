"use client";

import { useState } from "react";
import { translate } from "src/lib/translations";
import { CollapseMenuProps } from "./CollapseMenu";
import NavigationAnchor from "./NavigationAnchor";

function SubCollapseMenu({ menuItem }: CollapseMenuProps) {
  const [open, setOpen] = useState(false);
  const shouldDisplayAnchor = !menuItem.children?.length;

  return (
    <div className="mt-4">
      {shouldDisplayAnchor ? (
        <NavigationAnchor
          menuItem={menuItem}
          className="text-main text-[1.5rem] font-bold leading-[1.2em] flex w-full"
        />
      ) : (
        <>
          <button
            type="button"
            className="text-main text-[1.5rem] font-bold leading-[1.2em] flex w-full"
            onClick={() => setOpen(!open)}
          >
            {translate(menuItem, "name")}
            &nbsp;+
          </button>
          {open && (
            <div>
              {menuItem.children?.map((sub) => (
                <li key={sub.id} className="block mt-3 text-main-2 text-base">
                  {sub.name}
                </li>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SubCollapseMenu;

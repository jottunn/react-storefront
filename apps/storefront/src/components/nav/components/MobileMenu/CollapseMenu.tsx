"use client";

import clsx from "clsx";
import { useState } from "react";
import { translate } from "src/lib/translations";
import { MenuItemWithChildrenFragment } from "@/saleor/api";
import styles from "./BurgerMenu.module.css";
import SubCollapseMenu from "./SubCollapseMenu";
import NavigationAnchor from "./NavigationAnchor";

export interface CollapseMenuProps {
  menuItem: MenuItemWithChildrenFragment;
}

export function CollapseMenu({ menuItem }: CollapseMenuProps) {
  const [open, setOpen] = useState(false);

  const shouldDisplayAnchor = !menuItem.children?.length;

  return (
    <div className={styles.collapse}>
      {shouldDisplayAnchor ? (
        <NavigationAnchor menuItem={menuItem} className={styles["collapse-main"]} />
      ) : (
        <>
          <button
            type="button"
            className={clsx(styles["collapse-main"], {
              [styles["collapse-main--active"]]: open,
            })}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {translate(menuItem, "name")}
            <span className={clsx(styles.icon, { [styles.rotated]: open })} aria-hidden="true">
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

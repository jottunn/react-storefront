"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { getLinkPath } from "src/lib/menus";
import { translate } from "src/lib/translations";
import styles from "./BurgerMenu.module.css";
import { CollapseMenuProps } from "./CollapseMenu";
import NavigationAnchor from "./NavigationAnchor";

function SubCollapseMenu({ menuItem }: CollapseMenuProps) {
  const [open, setOpen] = useState(false);
  // console.log(menuItem);

  const shouldDisplayAnchor = !menuItem.children?.length;

  return (
    <div className="mt-4">
      {shouldDisplayAnchor ? (
        <NavigationAnchor menuItem={menuItem} className={styles["collapse-sub"]} />
      ) : (
        <>
          <button
            type="button"
            className={clsx(styles["collapse-sub"], {
              [styles["collapse-sub--active"]]: open,
            })}
            onClick={() => setOpen(!open)}
          >
            {translate(menuItem, "name")}
            {/* <ChevronDown /> */} ++
          </button>
          {open && (
            <div>
              {menuItem.children?.map((sub) => (
                <li key={sub.id} className={styles["menu-link"]}>
                  {sub.name}
                  {/* {sub.url ? (
                    <a href={sub.url} target="_blank" rel="noreferrer">
                      {sub.name}
                    </a>
                  ) : (
                    <Link href={getLinkPath(sub)} passHref legacyBehavior>
                      <a href="pass">{sub.name}</a>
                    </Link>
                  )} */}
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

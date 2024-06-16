import React from "react";
import DropdownMenu from "./DropdownMenu";
import styles from "./Navbar.module.css";
import MenuServer from "./MenuServer";

export default function Menu() {
  return (
    // @ts-expect-error Async Server Component
    <MenuServer>
      {(leftNavLinks, rightNavLinks) => (
        <nav className={styles.nav}>
          <ol>
            {leftNavLinks.menu?.items?.map((item) => (
              <li key={item?.id}>
                <DropdownMenu menuItem={item} />
              </li>
            ))}
          </ol>
          <ol>
            {rightNavLinks?.menu?.items?.map((item) => (
              <li key={item.id}>
                <DropdownMenu menuItem={item} />
              </li>
            ))}
          </ol>
        </nav>
      )}
    </MenuServer>
  );
}

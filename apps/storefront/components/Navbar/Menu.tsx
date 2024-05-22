import React, { memo } from "react";
import DropdownMenu from "./DropdownMenu";
import styles from "./Navbar.module.css";
import useMenuData from "@/lib/hooks/useMenuData";

export const Menu = () => {
  const { menuItems, rightMenuItems, error } = useMenuData();

  if (error) {
    console.error("Navbar/Menu component error", error.message);
    return null; // Or render some error message
  }

  return (
    <nav className={styles.nav}>
      <ol>
        {menuItems.map((item) => (
          <li key={item?.id}>
            <DropdownMenu key={item?.id} menuItem={item} />
          </li>
        ))}
      </ol>
      <ol>
        {rightMenuItems.map((item) => (
          <li key={item.id}>
            <DropdownMenu menuItem={item} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default memo(Menu);

import React from "react";

import { useMainMenuQuery, useMainRightMenuQuery } from "@/saleor/api";

import { useRegions } from "../RegionsProvider";
import DropdownMenu from "./DropdownMenu";
import styles from "./Navbar.module.css";

export function Menu() {
  const { query } = useRegions();

  const { error, data } = useMainMenuQuery({
    variables: { ...query },
  });

  const { error: rightMenuError, data: rightMenuData } = useMainRightMenuQuery({
    variables: { ...query },
  });

  if (error || rightMenuError) {
    console.error("Navbar/Menu component error", error?.message || rightMenuError?.message);
  }

  const menuItems = data?.menu?.items || [];
  const rightMenuItems = rightMenuData?.menu?.items || [];

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
}

export default Menu;

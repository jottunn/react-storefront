import Link from "next/link";

import { getLinkPath } from "@/lib/menus";
import { MenuItemWithChildrenFragment } from "@/saleor/api";

import { NavigationAnchor } from "../NavigationAnchor/NavigationAnchor";
import styles from "./Navbar.module.css";

interface DropdownProps {
  menuItem: MenuItemWithChildrenFragment;
}

function Dropdown({ menuItem }: DropdownProps) {
  return (
    <div className={styles.dropdown}>
      <NavigationAnchor menuItem={menuItem} className={styles["dropdown-trigger"]} />
      {!!menuItem.children?.length && (
        <div className={styles["dropdown-menu"]}>
          <div className="container pl-7">
            <div className="grid grid-cols-4 gap-[2rem] mx-2">
              {menuItem.children?.map((item) => {
                return (
                  <div key={item?.id}>
                    {item.name.length > 1 && (
                      <>
                        {item?.url ? (
                          <Link
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles["dropdown-main"]}
                          >
                            {item?.name}
                          </Link>
                        ) : (
                          <Link href={getLinkPath(item)} className={styles["dropdown-main"]}>
                            {item?.name}
                          </Link>
                        )}
                      </>
                    )}
                    {!!item?.children?.length && (
                      <ul className={styles["dropdown-ul"]}>
                        {item?.children?.map((sub) => (
                          <li key={sub?.id}>
                            <Link href={getLinkPath(sub)} className={styles["dropdown-link"]}>
                              {sub?.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;

import { MenuItemWithChildrenFragment } from "@/saleor/api";
import { NavigationAnchor } from "./components/MobileMenu/NavigationAnchor";
import styles from "./Navbar.module.css";
import { NavLink } from "./NavLink";
import getLinkPath from "@/lib/menus";

interface DropdownProps {
  menuItem: MenuItemWithChildrenFragment;
}
interface ColumnProps {
  items: MenuItemWithChildrenFragment[];
}
const Column: React.FC<ColumnProps> = ({ items }) => (
  <div className={styles["column"]}>
    {items.map((item) => (
      <div key={item?.id}>
        <NavLink href={item?.url || getLinkPath(item)} className={styles["dropdown-link"]}>
          {item?.name}
        </NavLink>
        {!!item?.children?.length && (
          <ul className={styles["dropdown-ul"]}>
            {item?.children?.map((sub) => (
              <li key={sub?.id}>
                <NavLink href={sub?.url || getLinkPath(sub)} className={styles["dropdown-sublink"]}>
                  {sub?.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </div>
);

function Dropdown({ menuItem }: DropdownProps) {
  const chunkArray = (
    arr: MenuItemWithChildrenFragment[],
    chunkSize: number,
  ): MenuItemWithChildrenFragment[][] => {
    let chunks: MenuItemWithChildrenFragment[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };
  const chunks = chunkArray(menuItem.children || [], 4);
  return (
    <div className={styles.dropdown}>
      <NavigationAnchor menuItem={menuItem} className={styles["dropdown-trigger"]} />
      {!!menuItem.children?.length && (
        <div className={styles["dropdown-menu"]}>
          <div className="container pl-7">
            <div className="grid grid-cols-3 gap-[2rem] mx-2 w-[70%]">
              {chunks.map((chunk, index) => (
                <Column key={index} items={chunk} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;

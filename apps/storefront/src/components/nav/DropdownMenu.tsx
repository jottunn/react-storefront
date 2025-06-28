import { MenuItemWithChildrenFragment } from "@/saleor/api";
import { NavigationAnchor } from "./components/MobileMenu/NavigationAnchor";
import { NavLink } from "./NavLink";
import getLinkPath from "@/lib/menus";
import React from "react";

interface DropdownProps {
  menuItem: MenuItemWithChildrenFragment;
}
interface ColumnProps {
  items: MenuItemWithChildrenFragment[];
}
const Column: React.FC<ColumnProps> = ({ items }) => (
  <div className="border-r-2 border-gray-200">
    {items.map((item) => (
      <React.Fragment key={item?.id}>
        <NavLink key={item?.id} href={item?.url || getLinkPath(item)}>
          {item?.name}
        </NavLink>
        {!!item?.children?.length && (
          <ul className="list-none mt-3" key={`ul-${item?.id}`}>
            {item?.children?.map((sub) => (
              <li key={sub?.id}>
                <NavLink
                  href={sub?.url || getLinkPath(sub)}
                  className="text-sm text-main-1 cursor-pointer leading-[1rem] ml-2 hover:underline"
                >
                  {sub?.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </React.Fragment>
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
    <div className="dropdown flex items-center h-full">
      <NavigationAnchor
        menuItem={menuItem}
        className="flex items-start text-center text-md font-bold hover:text-brand h-full px-4 uppercase"
      />
      {!!menuItem.children?.length && (
        <div className="dropdown-menu py-8 pl-4 absolute top-[12.9rem] left-0 bg-white w-full border-t border-b border-main-4 invisible shadow-xl">
          <div className="container mx-auto grid grid-cols-4 gap-[2rem]">
            {chunks.map((chunk, index) => (
              <Column key={index} items={chunk} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;

import React from "react";
import DropdownMenu from "./DropdownMenu";
import MenuServer from "./MenuServer";

export default function Menu() {
  return (
    // @ts-expect-error Async Server Component
    <MenuServer>
      {(leftNavLinks, rightNavLinks) => (
        <nav className="pl-0.5 h-full hidden lg:flex md:justify-between">
          <ol className="list-none flex items-center h-full">
            {leftNavLinks.menu?.items?.map((item) => (
              <li key={item.id} className="h-full">
                <DropdownMenu menuItem={item} />
              </li>
            ))}
          </ol>
          <ol className="list-none flex items-center h-full">
            {rightNavLinks?.menu?.items?.map((item) => (
              <li key={item.id} className="h-full">
                <DropdownMenu menuItem={item} />
              </li>
            ))}
          </ol>
        </nav>
      )}
    </MenuServer>
  );
}

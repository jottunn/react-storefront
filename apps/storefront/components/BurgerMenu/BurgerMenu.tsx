import clsx from "clsx";
// import { ChannelDropdown } from "../regionDropdowns/ChannelDropdown";
// import { LocaleDropdown } from "../regionDropdowns/LocaleDropdown";
import styles from "./BurgerMenu.module.css";
import { CollapseMenu } from "./CollapseMenu";
import { SearchBar } from "../Navbar/SearchBar";
import { XMarkIcon } from "@heroicons/react/24/solid";
import useMenuData from "@/lib/hooks/useMenuData";
import useLogout from "@/lib/hooks/useLogout";
import { useIntl } from "react-intl";
import { messages } from "../translations";
import { useUser } from "@/lib/useUser";

export interface BurgerMenuProps {
  open?: boolean;
  onCloseClick?: () => void;
}

export function BurgerMenu({ open, onCloseClick }: BurgerMenuProps) {
  const { menuItems, rightMenuItems, error } = useMenuData();
  const t = useIntl();
  const { authenticated } = useUser();

  const onLogout = useLogout();
  if (error) {
    console.error("BurgerMenu component error", error?.message);
  }

  return (
    <div
      className={clsx(styles.container, {
        [styles["container--open"]]: open,
      })}
    >
      <div className={styles.backdrop} aria-hidden="true" onClick={onCloseClick} />
      <div className={styles.body}>
        <div className="flex justify-start w-full mb-5">
          <XMarkIcon onClick={onCloseClick} className="w-8 h-8 cursor-pointer" />
        </div>

        {menuItems.map((item) => (
          <CollapseMenu menuItem={item} key={item.id} />
        ))}

        {rightMenuItems.map((item) => (
          <CollapseMenu menuItem={item} key={item.id} />
        ))}

        <div className="mt-auto pt-4">
          <div className="py-4">
            <SearchBar />
          </div>
        </div>
        {authenticated && (
          <div className="py-4">
            <button
              type="button"
              onClick={onLogout}
              tabIndex={-1}
              className="text-md font-semibold text-red-500 border border-red-500 py-2 px-4"
            >
              {t.formatMessage(messages.logOut)}
            </button>
            {/* <ChannelDropdown />
          <LocaleDropdown /> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default BurgerMenu;

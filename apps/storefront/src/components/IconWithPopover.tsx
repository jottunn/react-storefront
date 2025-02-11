import { PhoneIcon } from "@heroicons/react/24/outline";
import navbarStyles from "./nav/Navbar.module.css";
import popoverStyles from "./IconWithPopover.module.css";
const IconWithPopover: React.FC = () => {
  return (
    <div className={popoverStyles.popoverContainer}>
      <button className="mt-1">
        <PhoneIcon className={navbarStyles["nav-icon-button"]} />
      </button>
      <div className={popoverStyles.popover}>
        <a href="tel:0728949494">0728 94 94 94</a>
      </div>
    </div>
  );
};

export default IconWithPopover;

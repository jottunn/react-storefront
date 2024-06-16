import MenuServer from "../../MenuServer";
import { SearchBar } from "../../SearchBar";
import ClientMobileMenu from "./MobileMenuClient";

export default function MobileMenu() {
  return (
    // @ts-expect-error Async Server Component
    <MenuServer>
      {(leftNavLinks, rightNavLinks) => (
        <ClientMobileMenu leftNavLinks={leftNavLinks} rightNavLinks={rightNavLinks}>
          <SearchBar />
        </ClientMobileMenu>
      )}
    </MenuServer>
  );
}

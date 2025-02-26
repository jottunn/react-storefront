import CartModal from "./CartModal";
import CartNavItemServer from "./CartNavItemServer";

export default function CartNavItem() {
  return (
    /** @ts-expect-error Async Server Component  */
    <CartNavItemServer>{(messages) => <CartModal messages={messages} />}</CartNavItemServer>
  );
}

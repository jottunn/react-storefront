import { UserMenu } from "./UserMenu";
import Link from "next/link";
import styles from "../../Navbar.module.css";
import { UserIcon } from "@heroicons/react/24/outline";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { executeGraphQL } from "@/lib/graphql";
import { UserDocument, UserQuery } from "@/saleor/api";

export default async function UserMenuContainer() {
  const { user } = await executeGraphQL<UserQuery, {}>(UserDocument, {
    cache: "no-cache",
  });
  const messages = getMessages(DEFAULT_LOCALE);
  if (!user) {
    return (
      <Link href="/login" data-testid="userIcon">
        <UserIcon className={styles["nav-icon-button"]} />
      </Link>
    );
  }
  return <UserMenu messages={messages} />;
}

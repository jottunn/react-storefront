import { Messages, getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { ReactNode } from "react";

interface CartNavItemProps {
  children: (messages: Messages) => ReactNode;
}

export default async function CartNavItemServer({ children }: CartNavItemProps) {
  const messages = getMessages(DEFAULT_LOCALE);
  return <>{children(messages)}</>;
}

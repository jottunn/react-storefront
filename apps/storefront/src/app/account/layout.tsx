import { executeGraphQL } from "@/lib/graphql";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { Order, OrdersDocument, OrdersQuery, User, UserDocument, UserQuery } from "@/saleor/api";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import ClientAccountLayout from "./ClientAccountLayout";
import { mapEdgesToItems } from "@/lib/maps";

export type AccountLayoutProps = { children: ReactNode };

const AccountLayout = async ({ children }: AccountLayoutProps) => {
  const { user } = await executeGraphQL<UserQuery, {}>(UserDocument, {
    cache: "no-cache",
  });

  const { me: orders } = await executeGraphQL<OrdersQuery, {}>(OrdersDocument, {
    cache: "no-cache",
  });

  const userOrders = mapEdgesToItems(orders?.orders);
  const messages = getMessages(DEFAULT_LOCALE);

  if (!user) {
    return redirect("/login");
  }

  return (
    <ClientAccountLayout user={user as User} messages={messages} orders={userOrders as any}>
      {children}
    </ClientAccountLayout>
  );
};

export default AccountLayout;

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
  let user;
  try {
    const result = await executeGraphQL<UserQuery, {}>(UserDocument, {
      cache: "no-cache",
    });
    user = result.user;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  let userOrders;
  try {
    const getOrders = await executeGraphQL<OrdersQuery, {}>(OrdersDocument, {
      cache: "no-cache",
    });
    const orders = getOrders.me;
    userOrders = mapEdgesToItems(orders?.orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
  }

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

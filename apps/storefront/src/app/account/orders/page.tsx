import React from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/formatMoney";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { executeGraphQL } from "@/lib/graphql";
import { OrdersDocument, OrdersQuery } from "@/saleor/api";
import { mapEdgesToItems } from "@/lib/maps";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import LoginForm from "src/app/login/LoginForm";
export const dynamic = "force-dynamic";
const messages = getMessages(DEFAULT_LOCALE);

const OrderPage = async () => {
  const { me: orders } = await executeGraphQL<OrdersQuery, {}>(OrdersDocument, {
    cache: "no-cache",
    withAuth: true,
  });

  if (orders === null) {
    return (
      <div className="w-[85%] md:w-[35%]">
        <LoginForm messages={messages} />
      </div>
    );
  }

  const userOrders = mapEdgesToItems(orders?.orders);
  return (
    <>
      <div className="grid md:grid-cols-2 md:gap-8">
        {userOrders?.map((order) => (
          <Link href={`/account/orders/${order.id}`} key={order.id}>
            <div className="p-4 bg-white border rounded-md shadow cursor-pointer hover:bg-gray-100 text-base">
              <div className="flex justify-between">
                <div className="mb-2 space-x-2">
                  <span className="font-bold uppercase">{messages["app.account.orderNumber"]}</span>
                  <span>{order?.number}</span>
                </div>

                <ChevronDoubleRightIcon className="h-4 w-4" />
              </div>
              <div className="mb-2 space-x-2">
                <span className="font-semibold">{messages["app.account.orderCreateDate"]}:</span>
                <span>{order.created.slice(0, 10)}</span>
              </div>
              <div className="mb-2 space-x-2">
                <span className="font-semibold">Total:</span>
                <span>{formatMoney(order.total.gross)}</span>
              </div>
              <div className="mb-2 space-x-2">
                <span className="font-semibold">{messages["app.account.orderStatus"]}:</span>
                <span
                  className={clsx(
                    order.status === "FULFILLED" && "bg-action-4",
                    order.status === "CANCELED" && "bg-red-200",
                    " p-1",
                  )}
                >
                  {messages[order.status]}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default OrderPage;

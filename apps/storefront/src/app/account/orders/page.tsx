"use client";

import React from "react";
import { redirect, useRouter } from "next/navigation";
import { useUserContext } from "../UserContext";
import { formatPrice } from "@/lib/hooks/useRegions";

export default function OrderPage() {
  const { user, orders, messages } = useUserContext();
  const router = useRouter();
  if (!user) {
    redirect("/login");
  }

  return (
    <table className="w-full divide-y bg-white rounded-md ">
      <thead className="text-center h-16">
        <tr>
          <th className="w-1/4 font-semibold text-md">{messages["app.account.orderNumber"]}</th>
          <th className="w-1/4 font-semibold text-md">{messages["app.account.orderCreateDate"]}</th>
          <th className="w-1/4 font-semibold text-md md:text-center hidden md:table-cell">
            {messages["app.account.orderStatus"]}
          </th>
          <th className="w-1/4 font-semibold text-md">Total</th>
        </tr>
      </thead>
      <tbody className="text-center divide-y text-base">
        {orders?.map((order) => (
          <tr
            className="h-16 cursor-pointer hover:text-action-1 hover:bg-gray-100"
            key={order.id}
            onClick={() => router.push(`/account/orders/${order.token}`)}
          >
            <td>{order?.number}</td>
            <td>{order.created.slice(0, 10)}</td>
            <td className="hidden md:table-cell">{messages[order.status]}</td>
            <td>{formatPrice(order.total.gross)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

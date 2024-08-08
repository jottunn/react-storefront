"use client";

import React from "react";
import { redirect, useRouter } from "next/navigation";
import { useUserContext } from "../UserContext";
import { formatMoney } from "@/lib/utils/formatMoney";

export default function OrderPage() {
  const { user, orders, messages } = useUserContext();
  const router = useRouter();
  if (!user) {
    redirect("/login");
  }

  return (
    <>
      {/* Desktop Table */}
      <table className="hidden md:table w-full divide-y bg-white rounded-md ">
        <thead className="text-center h-16">
          <tr>
            <th className="w-1/4 font-semibold text-md">{messages["app.account.orderNumber"]}</th>
            <th className="w-1/4 font-semibold text-md">
              {messages["app.account.orderCreateDate"]}
            </th>
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
              <td>{formatMoney(order.total.gross)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile Cards */}
      <div className="md:hidden">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="p-4 mb-4 bg-white rounded-md shadow cursor-pointer hover:bg-gray-100 text-base"
            onClick={() => router.push(`/account/orders/${order.token}`)}
          >
            <div className="mb-2 space-x-4">
              <span className="font-semibold">{messages["app.account.orderNumber"]}:</span>
              <span>{order?.number}</span>
            </div>
            <div className="mb-2 space-x-4">
              <span className="font-semibold">{messages["app.account.orderCreateDate"]}:</span>
              <span>{order.created.slice(0, 10)}</span>
            </div>
            <div className="mb-2 space-x-4">
              <span className="font-semibold">{messages["app.account.orderStatus"]}:</span>
              <span>{messages[order.status]}</span>
            </div>
            <div className="mb-2 space-x-4">
              <span className="font-semibold">Total:</span>
              <span>{formatMoney(order.total.gross)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

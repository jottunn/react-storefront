"use client";
import Image from "next/image";
import { useUserContext } from "../../UserContext";
import { formatMoney } from "@/lib/utils/formatMoney";
import Spinner from "@/components/Spinner";
import AddressDisplay from "@/components/checkout/address/AddressDisplay";
import { useEffect, useState } from "react";
import { orderDetails } from "src/app/actions";
import { Order } from "@/saleor/api";

export default function Page({ params }: { params: { token: string } }) {
  const { messages } = useUserContext();
  const [order, setOrder] = useState<Order | null>(null);
  const token = decodeURIComponent(params.token);
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (token) {
        try {
          const result = await orderDetails({ token });
          if (result?.order) {
            setOrder(result.order as Order);
          }
        } catch (e) {
          // Handle the error
          console.error(e);
        }
      }
    };
    fetchOrderDetail();
  }, [token]);

  if (!order) {
    return <Spinner />;
  }

  return (
    <>
      <h1 className="text-2xl ml-2 md:ml-20 mt-5 font-bold text-gray-800 mb-2">
        {messages["app.account.orderDetail"]} : {order?.number}
      </h1>
      <p className="text-base ml-2 md:ml-20 font-semibold text-gray-600 mb-8">
        {messages["app.account.orderStatus"]} : {order?.status && messages[order?.status]}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 pb-10 pt-8 ml-2 md:ml-20 max-w-6xl h-full">
        <div className="col-span-2 md:col-span-4">
          <table className="w-full divide-y table-fixed">
            <thead className="text-center">
              <tr>
                <td className="md:w-1/4 font-semibold text-md md:text-center text-left">
                  {messages["app.account.orderDetailItems"]}
                </td>
                <td className="md:w-1/4 font-semibold text-md">
                  {messages["app.account.orderDetailPrice"]}
                </td>
                <td className="md:w-1/4 font-semibold text-md">{messages["app.quantity"]}</td>
                <td className="md:w-1/4 font-semibold text-md text-right">
                  <p className="mr-3 md:mr-10">Total</p>
                </td>
              </tr>
            </thead>
            <tbody className="text-center divide-y">
              {order?.lines.map((line) => (
                <tr key={line?.id} className="h-16">
                  <td className="my-3">
                    <div className="flex flex-row justify-center">
                      <Image
                        src={line?.thumbnail?.url || "/"}
                        alt={line?.thumbnail?.alt || " "}
                        width={70}
                        height={70}
                      />
                      <div className="flex flex-col justify-center">
                        <div>{line?.productName}</div>
                        <div className="text-xs text-left text-gray-600">{line?.variantName}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatMoney(line?.unitPrice.gross)}</td>
                  <td>{line?.quantity}</td>
                  <td>
                    <p className="mr-3 md:mr-10 text-right">
                      {formatMoney(line?.totalPrice.gross)}
                    </p>
                  </td>
                </tr>
              ))}
              <tr />
            </tbody>
          </table>
        </div>
        <div className="md:col-start-3 text-md h-16">
          <div className="mt-5 text-left md:text-center">Subtotal</div>
        </div>
        <div className="text-md text-center">
          <p className="mt-5 text-right mr-3 md:mr-10">{formatMoney(order?.subtotal.net)}</p>
        </div>
        <div className="md:col-start-3 col-span-2 border-t" />
        <div className="md:col-start-3 text-md h-16">
          <div className="mt-5 text-left md:text-center">
            {messages["app.account.orderDetailShippingPrice"]}
          </div>
        </div>
        <div className="text-md text-center">
          <p className="mt-5 text-right mr-3 md:mr-10">{formatMoney(order?.shippingPrice.gross)}</p>
        </div>
        <div className="md:col-start-3 col-span-2 border-t" />
        <div className="md:col-start-3 text-md font-semibold h-16">
          <div className="mt-5 text-left md:text-center">Total</div>
        </div>
        <div className="text-md font-semibold text-center">
          <p className="mt-5 text-right mr-3 md:mr-10">{formatMoney(order?.total.gross)}</p>
        </div>

        {!!order?.billingAddress && (
          <div className="col-span-2 mr-2 my-8 p-4 rounded shadow-xs bg-white border md:w-1/2 md:col-span-2 md:w-full">
            <h2 className="font-semibold text-lg mb-2">
              {messages["app.checkout.billingAddressCardHeader"]}
            </h2>
            <AddressDisplay address={order.billingAddress} />
          </div>
        )}

        {!!order?.shippingAddress && (
          <div className="col-span-2 mr-2 md:ml-2 my-8 p-4 shadow-xs rounded bg-white border md:w-1/2 md:col-start-3 md:col-span-2 md:w-full">
            <h2 className="font-semibold text-lg mb-2">
              {messages["app.checkout.billingMethodCardHeader"]}
            </h2>
            <AddressDisplay address={order.shippingAddress} />
          </div>
        )}
      </div>
    </>
  );
}

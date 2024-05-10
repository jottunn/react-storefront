import { useRouter } from "next/router";

import { usePaths } from "@/lib/paths";
import { OrderDetailsFragment } from "@/saleor/api";

import { useRegions } from "../RegionsProvider";
import messages from "../translations";
import { useIntl } from "react-intl";

export interface OrdersTableProps {
  orders: OrderDetailsFragment[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const paths = usePaths();
  const { formatPrice } = useRegions();
  const t = useIntl();
  return (
    <table className="w-full divide-y bg-white rounded-md ">
      <thead className="text-center h-16">
        <tr>
          <th className="w-1/4 font-semibold text-md">
            {t.formatMessage(messages.menuAccountOrderNumber)}
          </th>
          <th className="w-1/4 font-semibold text-md">
            {t.formatMessage(messages.menuAccountOrderCreateDate)}
          </th>
          <th className="w-1/4 font-semibold text-md md:text-center hidden md:table-cell">
            {t.formatMessage(messages.menuAccountOrderStatus)}
          </th>
          <th className="w-1/4 font-semibold text-md">Total</th>
        </tr>
      </thead>
      <tbody className="text-center divide-y">
        {orders?.map((order) => (
          <tr
            className="h-16 cursor-pointer"
            key={order.id}
            onClick={() => router.push(paths.account.orders._token(order.token).$url())}
          >
            <td>{order?.number}</td>
            <td>{order.created.slice(0, 10)}</td>
            <td className="hidden md:table-cell">{t.formatMessage({ id: order.status })}</td>
            <td>{formatPrice(order.total.gross)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

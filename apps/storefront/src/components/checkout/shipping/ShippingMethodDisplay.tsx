import { formatMoney } from "@/lib/utils/formatMoney";
import { translate } from "@/lib/translations";
import { ShippingMethod, Warehouse } from "@/saleor/api";

export interface ShippingMethodDisplayProps {
  method: ShippingMethod;
}

function ShippingMethodDisplay({ method }: ShippingMethodDisplayProps) {
  return (
    <div>
      <div className="mt-6 text-base font-medium text-gray-900">{translate(method, "name")}</div>
      <div className="mt-1 flex items-center text-sm text-gray-500">
        {method.minimumDeliveryDays || 2}-{method.maximumDeliveryDays || 14} business days
      </div>
      <div className="mt-6 text-sm font-medium text-gray-900">{formatMoney(method.price)}</div>
    </div>
  );
}

export default ShippingMethodDisplay;

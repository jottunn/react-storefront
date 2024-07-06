import { formatMoney } from "@/lib/utils/formatMoney";
import { translate } from "@/lib/translations";
import { ShippingMethod } from "@/saleor/api";
import { Messages } from "@/lib/util";
import edjsHTML from "editorjs-html";

export interface ShippingMethodDisplayProps {
  method: ShippingMethod;
  messages: Messages;
}
const parser = edjsHTML();
function ShippingMethodDisplay({ method, messages }: ShippingMethodDisplayProps) {
  const description = translate(method, "description");
  const parsedContent = description ? parser.parse(JSON.parse(description)) : "";
  return (
    <div>
      <div className="mt-6 text-base font-medium text-gray-900">{translate(method, "name")}</div>
      {parsedContent && (
        <div
          className="mt-6 text-sm font-medium text-gray-900"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />
      )}
      <div className="mt-1 flex items-center text-sm text-gray-500">
        {method.minimumDeliveryDays || 1}-{method.maximumDeliveryDays || 2}{" "}
        {messages["app.checkout.businessDays"]}
      </div>
      <div className="mt-6 text-sm font-medium text-gray-900">{formatMoney(method.price)}</div>
    </div>
  );
}

export default ShippingMethodDisplay;

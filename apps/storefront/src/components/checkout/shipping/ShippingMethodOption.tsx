import { Label, Radio, Description } from "@headlessui/react";
import clsx from "clsx";
import { translate } from "@/lib/translations";
import { DeliveryMethodFragment } from "@/saleor/api";
import { formatMoney } from "@/lib/utils/formatMoney";
import { Messages } from "@/lib/util";
import edjsHTML from "editorjs-html";

export interface ShippingMethodOptionProps {
  method: DeliveryMethodFragment;
  messages: Messages;
}
const parser = edjsHTML();
export function ShippingMethodOption({ method, messages }: ShippingMethodOptionProps) {
  const description = translate(method, "description");
  const parsedContent = description ? parser.parse(JSON.parse(description)) : "";

  return (
    <Radio
      key={method.id}
      value={method}
      className={({ checked }) =>
        clsx(
          checked
            ? "border-action-1 hover:border-action-1"
            : "border-gray-300 hover:border-action-3",
          "bg-white border rounded shadow-sm p-4 flex cursor-pointer",
        )
      }
    >
      {() => (
        <>
          <div className="flex-1 flex">
            <div className="flex flex-col">
              <Label as="span" className="block text-base font-medium text-gray-900">
                {translate(method, "name")}
              </Label>
              {parsedContent && <div dangerouslySetInnerHTML={{ __html: parsedContent }} />}
              <Description as="span" className="mt-1 flex items-center text-sm text-gray-500">
                {method.minimumDeliveryDays || 1}-{method.maximumDeliveryDays || 2}{" "}
                {messages["app.checkout.businessDays"]}
              </Description>
              <Description as="span" className="mt-6 text-sm font-medium text-gray-900">
                {formatMoney(method.price)}
              </Description>
            </div>
          </div>
        </>
      )}
    </Radio>
  );
}

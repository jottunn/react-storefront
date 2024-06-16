import { Label, Radio, Description } from "@headlessui/react";
import clsx from "clsx";
import { translate } from "@/lib/translations";
import { DeliveryMethodFragment } from "@/saleor/api";
import { formatPrice } from "@/lib/hooks/useRegions";

export interface ShippingMethodOptionProps {
  method: DeliveryMethodFragment;
}

export function ShippingMethodOption({ method }: ShippingMethodOptionProps) {
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
              <Description as="span" className="mt-1 flex items-center text-sm text-gray-500">
                {method.minimumDeliveryDays || 2}-{method.maximumDeliveryDays || 14} business days
              </Description>
              <Description as="span" className="mt-6 text-sm font-medium text-gray-900">
                {formatPrice(method.price)}
              </Description>
            </div>
          </div>
        </>
      )}
    </Radio>
  );
}

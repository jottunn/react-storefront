"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import React from "react";
import {
  ProductVariant,
  ProductDetailsFragment,
  ProductVariantDetailsFragment,
} from "@/saleor/api";
import { translate } from "@/lib/translations";
import { useRouter } from "next/navigation";

interface VariantSelectorClientProps {
  sizes: ProductVariant[];
  selectedVariant?: ProductVariantDetailsFragment;
  product: ProductDetailsFragment;
  hasSizeGuide: boolean;
}

const VariantSelectorClient: React.FC<VariantSelectorClientProps> = ({
  sizes,
  selectedVariant,
  product,
  hasSizeGuide,
}) => {
  const router = useRouter();

  const handleSelect = (variantId: string) => {
    const selectedVariant = sizes.find((variant) => variant.id === variantId);
    if (selectedVariant) {
      router.push(`/p/${product.slug}?variant=${selectedVariant.id}`); // Adjust the path as needed
    }
  };
  return (
    <Listbox value={selectedVariant?.id} onChange={handleSelect}>
      <ListboxButton
        className={clsx(
          "relative block h-[40px] min-w-[120px] border border-1 border-dark-900 py-2 pr-8 pl-3 text-left text-[1.5rem] text-dark-700",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-dark-700",
          { "m-auto": !hasSizeGuide },
        )}
      >
        {selectedVariant?.name}
        <ChevronDownIcon
          className="group pointer-events-none absolute top-3 right-2.5 size-4 fill-dark/60"
          aria-hidden="true"
        />
      </ListboxButton>
      <Transition
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <ListboxOptions
          anchor="bottom"
          className="w-[var(--button-width)] border border-dark-900 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none bg-white"
        >
          {sizes.map((variant) => {
            return (
              <ListboxOption
                key={variant.id}
                value={variant.id}
                className={({ selected }) =>
                  clsx(
                    "text-[1.5rem] group flex cursor-pointer items-center gap-2 py-1.5 px-3 select-none data-[focus]:bg-dark/10 hover:bg-gray-100 hover:text-dark-500",
                    selected ? "text-action-1" : "text-dark-900",
                  )
                }
              >
                <CheckIcon className="invisible size-4 fill-action-1 group-data-[selected]:visible" />
                {translate(variant, "name")}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </Transition>
    </Listbox>
  );
};

export default VariantSelectorClient;

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
import React, { useEffect, useState } from "react";
import { ProductVariant, ProductDetailsFragment } from "@/saleor/api";
import { translate } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { Messages } from "@/lib/util";
import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";

interface VariantSelectorClientProps {
  sizes: ProductVariant[];
  product: ProductDetailsFragment;
  hasSizeGuide: boolean;
  messages: Messages;
  handleSizeSelect: any;
  handleSizeLoading: any;
}

const VariantSelectorClient: React.FC<VariantSelectorClientProps> = ({
  sizes,
  product,
  hasSizeGuide,
  messages,
  handleSizeSelect,
  handleSizeLoading,
}) => {
  const router = useRouter();
  // Initialize selectedSize with the single size option if it exists
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 && sizes[0]?.id ? sizes[0].id : null,
  );

  // Add useEffect to update selectedSize when sizes change
  useEffect(() => {
    if (sizes.length === 1 && sizes[0]?.id) {
      setSelectedSize(sizes[0].id);
      // Optionally notify parent that a size is selected
      handleSizeSelect(true);
    } else if (sizes.length === 0) {
      setSelectedSize(null);
    }
  }, [sizes, handleSizeSelect]);

  const handleSelect = async (variantId: string) => {
    if (variantId !== selectedSize) {
      setSelectedSize(variantId);
      handleSizeLoading(true);
      const selectedVariant = sizes.find((variant) => variant.id === variantId);
      const colorVariant = selectedVariant?.attributes.find(
        (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
      );
      const colorValue = colorVariant?.values[0]["slug"] || "";

      if (selectedVariant) {
        await router.push(
          `/p/${product.slug}${colorValue ? `--${colorValue}` : ""}?variant=${selectedVariant.id}`,
        );
        setTimeout(() => {
          handleSizeSelect(variantId ? true : false);
        }, 500);
      }
    }
  };

  return (
    <Listbox value={selectedSize} onChange={handleSelect}>
      <ListboxButton
        className={clsx(
          "relative block h-[40px] min-w-[120px] border border-1 border-dark-900 py-2 pr-8 pl-3 text-left text-[1.5rem] text-dark-700",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-dark-700",
          { "m-auto": !hasSizeGuide },
        )}
      >
        {selectedSize ? sizes.find((s) => s.id === selectedSize)?.name : messages["app.size"]}
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
          {sizes.map((variant, index) => {
            return (
              <ListboxOption
                key={variant.id || index}
                value={variant.id}
                className={({ selected }) =>
                  clsx(
                    "text-[1.5rem] group flex cursor-pointer items-center gap-2 py-1.5 px-1 select-none data-[focus]:bg-dark/10 hover:bg-gray-100 hover:text-dark-500",
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

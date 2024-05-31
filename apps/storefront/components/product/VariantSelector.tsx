import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  RadioGroup,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { usePaths } from "@/lib/paths";
import { translate } from "@/lib/translations";
import {
  PageFragment,
  ProductDetailsFragment,
  ProductVariant,
  ProductVariantDetailsFragment,
} from "@/saleor/api";
import { useRegions } from "../RegionsProvider";
import { VariantColorSelector } from "./VariantColorSelector";
import { useProductInfo } from "../../lib/hooks/useProductInfo";
import { ATTR_COLOR_SLUG } from "@/lib/const";
import { useIntl } from "react-intl";
import { messages } from "@/components/translations";

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
  setShowSizeGuideModal?: React.Dispatch<React.SetStateAction<boolean>>;
  sizeGuide?: PageFragment;
}

function getColorOfVariant(productVariant: ProductVariantDetailsFragment) {
  if (productVariant && Array.isArray(productVariant.attributes)) {
    for (const attribute of productVariant.attributes) {
      if (
        attribute.attribute.slug === ATTR_COLOR_SLUG &&
        attribute.values &&
        attribute.values.length > 0
      ) {
        const color = attribute.values[0].name;
        if (color) {
          return color; // Return immediately upon finding the color
        }
      }
    }
  }
  return ""; // Return default color if none is found
}
function getGroupedVariants(currentColor: string, variants: ProductVariant[]) {
  return variants
    .filter((variant) => variant.quantityAvailable)
    .filter((variant) => {
      const colorAttribute = variant.attributes.find(
        (attribute) => attribute.attribute.slug === ATTR_COLOR_SLUG,
      );
      return colorAttribute && colorAttribute.values.some((value) => value.name === currentColor);
    });
}

// function getColorOfVariant(productVariant: ProductVariantDetailsFragment) {
//   let color = "";
//   if (productVariant && Array.isArray(productVariant.attributes)) {
//     productVariant.attributes.forEach((attribute) => {
//       if (attribute.attribute.slug === ATTR_COLOR_SLUG) {
//         attribute.values.forEach((value: any) => {
//           color = value.name;
//         });
//       }
//     });
//   }
//   return color;
// }

export function VariantSelector({
  product,
  selectedVariant,
  sizeGuide,
  setShowSizeGuideModal,
}: VariantSelectorProps) {
  const paths = usePaths();
  const router = useRouter();
  const { formatPrice } = useRegions();
  const { getProductPrice } = useProductInfo();
  const [selectedVariantID, setSelectedVariantID] = useState(selectedVariant?.id);
  const { variants } = product;
  const t = useIntl();

  //console.log("VariantSelector render");
  const availableVariants = variants && variants.filter((variant) => variant.quantityAvailable);
  // console.log('availableVariants', availableVariants);

  const currentColor = useMemo(() => {
    return selectedVariant ? getColorOfVariant(selectedVariant) : "";
  }, [selectedVariant]);

  const sizes = useMemo(() => {
    return currentColor ? getGroupedVariants(currentColor, variants as ProductVariant[]) : variants;
  }, [selectedVariant]);
  const hasSizeGuide = sizeGuide && Object.keys(sizeGuide).length > 0;
  useEffect(() => {
    setSelectedVariantID(selectedVariant?.id || "");
  }, [selectedVariant?.id]);

  // Skip displaying selector when theres no variant
  if (!variants || variants.length === 0) {
    return null;
  }

  const onChange = async (value: string) => {
    // Set the selected variant immediately.
    setSelectedVariantID(value);

    // Perform the router navigation.
    // This navigation is async, but since React 18+, React batches updates more efficiently.
    await router.replace(
      paths.products._slug(product.slug).$url({ ...(value && { query: { variant: value } }) }),
      undefined,
      { shallow: true, scroll: false },
    );

    // Any other logic that depends on the completion of the navigation.
    // Note: React does not guarantee batching across asynchronous boundaries by default,
    // but in practice, this will lead to fewer, more efficient updates than if these were
    // dispatched separately without consideration.
  };

  // const onChange = (value: string) => {
  //   setSelectedVariant(value);
  //   void router.replace(
  //     paths.products._slug(product.slug).$url({ ...(value && { query: { variant: value } }) }),
  //     undefined,
  //     {
  //       shallow: true,
  //       scroll: false,
  //     }
  //   );
  // };

  return (
    <>
      <div className="w-full">
        {selectedVariant ? (
          <h2 className="text-xl font-bold tracking-tight text-gray-800 text-center">
            <span>{formatPrice(selectedVariant?.pricing?.price?.gross)}</span>
            {selectedVariant?.pricing?.onSale && (
              <span className="text-lg ml-2 opacity-75">
                <s>{formatPrice(selectedVariant.pricing.priceUndiscounted?.gross)}</s>
              </span>
            )}
          </h2>
        ) : (
          <h2 className="text-xl font-bold tracking-tight text-gray-800 text-center">
            <span>{getProductPrice(product)}</span>
            {product.variants?.[0]?.pricing?.onSale && (
              <span className="text-lg ml-2 opacity-75">
                <s>{formatPrice(product.variants?.[0].pricing.priceUndiscounted?.gross)}</s>
              </span>
            )}
          </h2>
        )}

        <VariantColorSelector product={product} currentColor={currentColor} />

        <div
          className={clsx("w-full m-auto mb-6", {
            "grid grid-cols-2 gap-[50px]": hasSizeGuide,
          })}
        >
          <div
            className={clsx("flex flex-col justify-center md:py-6", {
              "items-end": hasSizeGuide,
            })}
          >
            <p
              className={clsx("text-md font-semibold", hasSizeGuide ? "text-left" : "text-center")}
            >
              {sizes && sizes.length > 1 ? (
                <span className="text-left">{t.formatMessage(messages.chooseSize)}</span>
              ) : (
                <span>
                  {sizes && !sizes[0].name.includes("unică") && t.formatMessage(messages.size)}
                  <span className="text-md font-bold ml-2">{(sizes && sizes[0].name) || ""}</span>
                </span>
              )}
            </p>

            {sizes && sizes.length > 1 && (
              <Listbox value={selectedVariantID} onChange={onChange}>
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
            )}
          </div>

          {hasSizeGuide && (
            <div className="flex justify-start items-center py-6">
              <div className="min-w-[180px] w-full">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSizeGuideModal && setShowSizeGuideModal(true);
                  }}
                  className="text-sm hover:text-action-1 font-bold py-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 32 32"
                    className="inline-flex relative shrink justify-center items-center transition w-xl h-xl touch:group-active:[&amp;>*]:fill-ghost [&amp;>*]:fill-ink [&amp;>*]:hover:fill-ink-hover"
                  >
                    <path
                      fill="#000"
                      fillRule="evenodd"
                      d="M8.865 9.01a.993.993 0 0 0-.854.856c-.015.1-.015 4.16 0 4.27.052.397.35.732.739.833.13.033-.184.03 4.125.033l3.98.002-1.399 1.4c-1.382 1.382-1.4 1.4-1.422 1.448a.42.42 0 0 0-.03.09c-.005.029-.006.712-.005 2.434.003 2.59 0 2.414.034 2.543.064.247.229.468.451.604.102.063.202.1.352.132.044.01.416.01 4.103.012 2.745.002 4.08 0 4.136-.004a1.005 1.005 0 0 0 .917-.864c.013-.101.013-4.162 0-4.263a.999.999 0 0 0-.892-.863 57.398 57.398 0 0 0-1.348-.007h-1.28l1.401-1.401c1.334-1.333 1.403-1.403 1.426-1.448a.366.366 0 0 0 .03-.082c.01-.049.009-4.744 0-4.833a.999.999 0 0 0-.863-.892c-.098-.013-13.506-.013-13.6 0Zm.08.663a.314.314 0 0 0-.186.102.292.292 0 0 0-.074.121l-.015.042-.002 2.035c-.001 1.423 0 2.049.005 2.08a.34.34 0 0 0 .255.271c.023.005.2.008.552.008h.518V9.665h-.51c-.281.001-.526.004-.544.007Zm1.725 2.326v2.332h12l-.002-2.193c-.001-2.12-.002-2.195-.013-2.229a.325.325 0 0 0-.088-.142.325.325 0 0 0-.182-.095c-.03-.004-.22-.006-.547-.005l-.503.002-.003.874-.003.873-.015.037a.342.342 0 0 1-.364.21.341.341 0 0 1-.277-.262 27.247 27.247 0 0 1-.006-.885v-.85H18.67l-.002.865-.001.866-.015.04c-.02.057-.05.1-.096.143a.301.301 0 0 1-.155.08.337.337 0 0 1-.386-.221l-.014-.042-.002-.866-.001-.865H16v.853c0 .94.002.895-.04.973a.357.357 0 0 1-.146.141.337.337 0 0 1-.462-.183l-.014-.034-.004-.873-.003-.874h-1.996l-.004.874-.003.873-.015.037a.342.342 0 0 1-.364.21.341.341 0 0 1-.277-.262 27.247 27.247 0 0 1-.006-.885v-.85H10.67v2.333Zm5.801 4.336-1.33 1.33H19.53l1.33-1.33 1.332-1.332h-4.39l-1.332 1.332Zm-1.801 4.187c0 2.414-.003 2.223.04 2.303a.36.36 0 0 0 .205.163c.028.008.68.009 4.089.009 4.027 0 4.055 0 4.096-.013a.342.342 0 0 0 .229-.262c.009-.058.009-4.051 0-4.109a.33.33 0 0 0-.094-.179.32.32 0 0 0-.143-.087c-.031-.01-.07-.012-.395-.014l-.36-.002-.001.866-.002.866-.015.041a.335.335 0 0 1-.477.19.352.352 0 0 1-.17-.23 22.701 22.701 0 0 1-.007-.886v-.847h-.974c-.536 0-.985.002-.999.005l-.024.004v.848c0 .735-.001.855-.01.89a.336.336 0 0 1-.47.223.375.375 0 0 1-.158-.162l-.024-.05-.003-.877-.003-.877H17.003l-.003.873c-.003.819-.004.876-.015.902a.362.362 0 0 1-.208.207.41.41 0 0 1-.222-.001.346.346 0 0 1-.214-.242c-.005-.024-.007-.291-.007-.888v-.855H14.67v2.191Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {t.formatMessage(messages.sizeGuide)}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VariantSelector;

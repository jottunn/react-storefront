"use client";
import { Transition, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Fragment } from "react";

export interface FilterDropdownOption {
  id: string;
  label: string;
  slug: string;
  chosen: boolean;
  value: string;
  inputType: string;
}

export interface FilterDropdownProps {
  label: string;
  options?: FilterDropdownOption[];
  attributeSlug: string;
  optionToggle: (attributeSlug: string, choiceSlug: string) => void;
}

export function FilterDropdown({
  label,
  attributeSlug,
  optionToggle,
  options,
}: FilterDropdownProps) {
  // console.log('options', options);
  return (
    <Disclosure
      as="div"
      className="relative block text-left border-b border-b-gray-300 mr-8 w-full mb-2"
      defaultOpen={true}
    >
      {({ open }) => (
        <>
          <div>
            <DisclosureButton
              className="inline-flex w-full justify-between px-2 py-3 text-base font-medium  hover:bg-opacity-30"
              data-testid={`filterAttribute${label}`}
            >
              {label}
              <ChevronDownIcon
                className={`${open ? "transform rotate-180" : ""} ml-2 -mr-1 h-5 w-5`}
                aria-hidden="true"
              />
            </DisclosureButton>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <DisclosurePanel className="focus:outline-none origin-top-right bg-transparent border-t border-b-gray-200 z-10 max-h-[300px] overflow-y-auto py-2">
              {options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => optionToggle(attributeSlug, option.slug)}
                  className={clsx(
                    "group flex w-full items-center px-2 py-3 text-base",
                    option.chosen ? "font-semibold" : "font-normal",
                    "text-gray-900",
                  )}
                  data-testid={`filterAttributeValue${option.label}`}
                  title={option.label}
                >
                  <span
                    className={clsx(
                      "inline-block mr-2 relative",
                      option.inputType === "SWATCH" ? "w-8 h-8" : "w-5 h-5",
                      option.inputType === "SWATCH" ? "rounded-full" : "rounded-sm",
                      option.chosen && option.inputType !== "SWATCH"
                        ? "border border-brand"
                        : "border border-gray-400",
                      option.chosen && option.inputType !== "SWATCH"
                        ? "bg-gray-100"
                        : "bg-transparent",
                    )}
                    aria-hidden="true"
                    style={option.inputType === "SWATCH" ? { backgroundColor: option.value } : {}}
                  >
                    {option.chosen && option.inputType !== "SWATCH" && (
                      <svg
                        className="absolute inset-0 w-6 h-6 m-auto text-action-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {option.inputType === "SWATCH" &&
                      option.chosen &&
                      option.label !== "multicolor" &&
                      (option.label !== "alb" ? (
                        <svg
                          className="absolute inset-0 w-6 h-6 m-auto text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L10 15.586l8.293-8.293a1 1 0 011.414 1.414l-9 9A1 1 0 0110 18z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="absolute inset-0 w-6 h-6 m-auto text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L10 15.586l8.293-8.293a1 1 0 011.414 1.414l-9 9A1 1 0 0110 18z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    {option.inputType === "SWATCH" && option.label === "multicolor" && (
                      <svg
                        className="absolute inset-0 w-full h-full rounded-full"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                      >
                        <defs>
                          <linearGradient
                            id={`multicolor-gradient-${option.id}`}
                            gradientTransform="rotate(45)"
                          >
                            <stop offset="0%" stopColor="#4028e8" />
                            <stop offset="30%" stopColor="#5393b3" />
                            <stop offset="60%" stopColor="#00ff00" />
                            <stop offset="80%" stopColor="#e6d54d" />
                            <stop offset="100%" stopColor="#a6295e" />
                          </linearGradient>
                        </defs>
                        <rect
                          width="100"
                          height="100"
                          fill={`url(#multicolor-gradient-${option.id})`}
                        />
                        {option.chosen && (
                          <svg
                            className="absolute inset-0 w-6 h-6 m-auto text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L10 15.586l8.293-8.293a1 1 0 011.414 1.414l-9 9A1 1 0 0110 18z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </svg>
                    )}
                  </span>
                  <span className="capitalize text-left">{option.label}</span>
                </button>
              ))}
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

export default FilterDropdown;

import { Transition, Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import { Fragment } from "react";

export interface FilterDropdownOption {
  id: string;
  label: string;
  slug: string;
  chosen: boolean;
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
  return (
    <Disclosure
      as="div"
      className="relative block text-left border-b border-b-gray-300 md:border md:border-gray-200 mr-8 w-full"
    >
      {({ open }) => (
        <>
          <div>
            <Disclosure.Button
              className="inline-flex w-full justify-between px-2 py-3 text-base font-medium  hover:bg-opacity-30"
              data-testid={`filterAttribute${label}`}
            >
              {label}
              <ChevronDownIcon
                className={`${open ? "transform rotate-180" : ""} ml-2 -mr-1 h-5 w-5`}
                aria-hidden="true"
              />
            </Disclosure.Button>
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
            <Disclosure.Panel className="focus:outline-none origin-top-right bg-transparent border-t border-b-gray-200 z-10 max-h-[300px] overflow-y-auto py-2">
              {options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => optionToggle(attributeSlug, option.slug)}
                  className={clsx(
                    "group flex w-full items-center px-2 py-3 text-base",
                    option.chosen ? "text-brand" : "text-gray-900"
                  )}
                  data-testid={`filterAttributeValue${option.label}`}
                >
                  <span
                    className={`inline-block mr-2 rounded-sm w-5 h-5 ${
                      option.chosen
                        ? "bg-brand border-transparent"
                        : "bg-transparent border border-gray-400"
                    }`}
                    aria-hidden="true"
                  ></span>
                  {option.label}
                </button>
              ))}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

export default FilterDropdown;

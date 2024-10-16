"use client";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Fragment } from "react";
import { OrderDirection, ProductOrderField } from "@/saleor/api";
import { getSortingOptions, UrlSorting } from "./sorting";
import { Messages } from "@/lib/util";

export interface SortingDropdownProps {
  optionToggle: (field?: ProductOrderField, direction?: OrderDirection) => void;
  chosen: UrlSorting | null;
  messages: Messages;
}

export function SortingDropdown({ optionToggle, chosen, messages }: SortingDropdownProps) {
  const options = getSortingOptions(chosen, messages);
  // Determine the label to display
  let currentLabel = chosen
    ? options.find(
        (option) => option.field === chosen.field && option.direction === chosen.direction,
      )?.label
    : messages["app.sort.sortByDefault"];
  if (!currentLabel) {
    currentLabel = messages["app.sort.sortByDefault"];
  }
  return (
    <Menu as="div" className="inline text-left float-right w-[160px] mb-8 md:mb-0">
      <div>
        <MenuButton
          className="inline-flex w-full justify-left px-2 py-2 text-base font-medium  hover:bg-opacity-30 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-left"
          data-testid="sortBy"
        >
          {currentLabel}
          <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5 " aria-hidden="true" />
        </MenuButton>
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
        <MenuItems
          className="focus:outline-none absolute left-0 w-50 origin-top-right bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10"
          data-testid="sortingDropdown"
        >
          {options?.map((option) => (
            <MenuItem key={option.label}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => optionToggle(option.field, option.direction)}
                  className={clsx(
                    active ? "border-brand text-brand" : "border-transparent text-gray-900",
                    "group flex w-full items-center px-2 py-2 text-base border-2 text-left",
                  )}
                  data-testid={`sortByOption${option.label}`}
                >
                  {option.label}
                  {option.chosen && (
                    <CheckIcon className="ml-2 -mr-1 h-5 w-3 " aria-hidden="true" />
                  )}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export default SortingDropdown;

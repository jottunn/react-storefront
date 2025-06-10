"use client";

import { Fragment } from "react";
import ProductFilters from "./ProductFilters";
import { Transition, TransitionChild, Dialog, DialogPanel } from "@headlessui/react";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";

interface MobileFiltersProps {
  optionToggle: (attributeSlug: string, choiceSlug: string) => void;
  categoryIDs?: string[];
  categorySlug?: string;
  collectionIDs?: string[];
  productsIDs?: string[];
  search?: any;
  closeModal: any;
  messages: any;
  show: boolean;
}
export default function MobileFilters({
  optionToggle,
  categoryIDs,
  categorySlug,
  collectionIDs,
  productsIDs,
  search,
  closeModal,
  messages,
  show,
}: MobileFiltersProps) {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog onClose={closeModal} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>
        <TransitionChild
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-[-100%]"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-[-100%]"
        >
          <DialogPanel className="fixed bottom-0 left-0 top-0 flex h-full w-[310px] flex-col border-l border-neutral-200 bg-white/90 p-6 pb-12 text-black backdrop-blur-xl md:w-[430px] overflow-x-hidden overflow-y-auto">
            <div className="flex justify-between justify-start w-full items-center mb-6">
              <span className="text-md font-bold uppercase">{messages["app.filterBy"]}</span>
              <button title="Close" aria-label="Close cart" onClick={closeModal} type="button">
                <div className="relative flex h-11 w-11 items-center justify-center text-black transition-colors dark:border-neutral-700 dark:text-dark">
                  <XMarkIcon className="w-10 h-10 text-gray-900 bg-gray-100 border border-gray-900 hover:text-red-900 hover:border-red-900" />
                </div>
              </button>
            </div>
            <ProductFilters
              optionToggle={optionToggle}
              categoryIDs={categoryIDs}
              categorySlug={categorySlug}
              collectionIDs={collectionIDs}
              productsIDs={productsIDs}
              search={search}
            />
            <button
              title="Apply"
              aria-label="Apply filters"
              onClick={closeModal}
              type="button"
              className="bg-black p-3 mt-4 text-white text-md w-2/5"
            >
              {messages["app.buttons.apply"]}
            </button>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

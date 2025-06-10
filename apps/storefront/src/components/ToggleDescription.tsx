"use client";
import React from "react";
import edjsHTML from "editorjs-html";
import xss from "xss";
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Messages } from "@/lib/util";

export interface ToggleDescriptionProps {
  description?: string;
  messages?: Messages;
}
const edjsParser = edjsHTML();

function ToggleDescription({ description, messages }: ToggleDescriptionProps) {
  const cleanedDescriptionT = description && JSON.parse(description);
  const excerpt = cleanedDescriptionT && edjsParser.parseBlock(cleanedDescriptionT.blocks[0]);
  const parsedDescription = cleanedDescriptionT ? edjsParser.parse(cleanedDescriptionT) : null;
  const remainingBlocks = parsedDescription ? parsedDescription.slice(1) : null;

  return (
    <div className="container">
      <div className="px-8 my-8 min-h-[200px] md:ml-[300px] border-t">
        {excerpt && (
          <div
            className="text-md inline-block my-6 text-main "
            dangerouslySetInnerHTML={{ __html: xss(excerpt) }}
          />
        )}
        {cleanedDescriptionT && cleanedDescriptionT.blocks.length > 1 && parsedDescription && (
          <Disclosure>
            {({ open }) => (
              <div>
                <DisclosureButton className="text-main-1 hover:text-action-1 text-base inline-block">
                  <span className="flex">
                    <span className="border border-transparent border-b-main-1 hover:border-b-action-1">
                      {open
                        ? (messages && messages["app.ui.hide"]) || ""
                        : (messages && messages["app.ui.readmore"]) || ""}
                    </span>
                    {open ? (
                      <ChevronUpIcon className="h-5 w-5 ml-2 relative top-[2px]" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 ml-2 relative top-[2px]" />
                    )}
                  </span>
                </DisclosureButton>

                <Transition
                  show={open}
                  enter="transition duration-300 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-100 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <DisclosurePanel static className="text-md block mt-4 mb-8 py-0 text-main-1">
                    {remainingBlocks &&
                      remainingBlocks.map((content) => (
                        <div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
                      ))}
                  </DisclosurePanel>
                </Transition>
              </div>
            )}
          </Disclosure>
        )}
      </div>
    </div>
  );
}

export default ToggleDescription;

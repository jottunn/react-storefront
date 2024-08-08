"use client";
import React from "react";
import Link from "next/link";
import Box from "./Box";
import edjsHTML from "editorjs-html";
import xss from "xss";
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Messages } from "@/lib/util";

export interface PageHeroProps {
  title: string;
  description?: string;
  pills?: {
    label: string;
    slug: string;
  }[];
  messages?: Messages;
}
const edjsParser = edjsHTML();

export function PageHero({ title, description, pills = [], messages }: PageHeroProps) {
  const cleanedDescriptionT = description && JSON.parse(description);
  const excerpt = cleanedDescriptionT && edjsParser.parseBlock(cleanedDescriptionT.blocks[0]);
  const parsedDescription = cleanedDescriptionT ? edjsParser.parse(cleanedDescriptionT) : null;
  const remainingBlocks = parsedDescription ? parsedDescription.slice(1) : null;

  return (
    <Box>
      <div className="text-center">
        <h1 className="text-4xl" data-testid={`titleOf${title}`}>
          {title}
        </h1>
        {pills.length > 0 && (
          <div className="hidden md:flex md:gap-2 md:flex-wrap md:items-center md:justify-center my-4 md:mt-6">
            {pills.map((pill) => (
              <Link
                key={pill.label}
                href={`/c/${pill.slug}`}
                className="cursor-pointer h-10 py-2 inline-flex items-center border border-gray-400 text-base hover:border-action-1 hover:text-action-1 whitespace-nowrap px-4"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        )}
        {excerpt && (
          <div
            className="text-md inline-block my-6 text-main "
            dangerouslySetInnerHTML={{ __html: xss(excerpt) }}
          />
        )}
        {cleanedDescriptionT && cleanedDescriptionT.blocks.length > 1 && parsedDescription && (
          <Disclosure>
            {({ open }) => (
              <>
                <DisclosureButton className="text-main-1 hover:text-action-1 text-base inline-block ml-6">
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
                  <DisclosurePanel static className="text-md block mt-0 mb-8 py-0 text-main-1">
                    {remainingBlocks &&
                      remainingBlocks.map((content) => (
                        <div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
                      ))}
                  </DisclosurePanel>
                </Transition>
              </>
            )}
          </Disclosure>
        )}
      </div>
    </Box>
  );
}

export default PageHero;

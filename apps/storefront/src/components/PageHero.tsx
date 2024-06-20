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
  const cleanedDecsriptionT = description && JSON.parse(description);
  const excerpt = cleanedDecsriptionT && edjsParser.parseBlock(cleanedDecsriptionT.blocks[0]);
  const parsedDescription = cleanedDecsriptionT ? edjsParser.parse(cleanedDecsriptionT) : null;
  const remainingBlocks = parsedDescription ? parsedDescription.slice(1) : null;

  return (
    <Box>
      <div className="text-center">
        <h1 className="text-4xl font-bold" data-testid={`titleOf${title}`}>
          {title}
        </h1>
        {excerpt && (
          <div
            className="text-md inline-block my-6 text-main "
            dangerouslySetInnerHTML={{ __html: xss(excerpt) }}
          />
        )}
        {cleanedDecsriptionT && cleanedDecsriptionT.blocks.length > 1 && parsedDescription && (
          <Disclosure>
            {({ open }) => (
              <>
                <DisclosureButton className="text-main-1 hover:text-action-1 text-base italic border border-transparent hover:border-b-action-1 inline-block ml-6">
                  <span className="flex">
                    {open
                      ? (messages && messages["app.ui.hide"]) || ""
                      : (messages && messages["app.ui.readmore"]) || ""}
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
        {pills.length > 0 && (
          <div className="hidden md:flex md:gap-2 md:flex-wrap md:items-center md:justify-center md:mt-5 my-4">
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
      </div>
    </Box>
  );
}

export default PageHero;

"use client";

import { useState } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React from "react";
import { UPLOAD_FOLDER } from "@/lib/const";
import edjsHTML from "editorjs-html";
import { Messages } from "@/lib/util";
import { translate } from "@/lib/translations";
const parser = edjsHTML();

export default function SizeGuide({ sizeGuide, messages }: { sizeGuide: any; messages: Messages }) {
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const content =
    sizeGuide.page.content && "content" in sizeGuide.page
      ? translate(sizeGuide.page, "content")
      : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  return (
    <>
      <div className="flex justify-start items-end py-6">
        <div className="min-w-[180px] w-full">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowSizeGuideModal(true);
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
            {messages["app.sizeGuide"]}
          </a>
        </div>
      </div>
      <Transition show={showSizeGuideModal} as={React.Fragment}>
        <Dialog
          open={showSizeGuideModal}
          onClose={() => setShowSizeGuideModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 w-screen overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <DialogPanel className="max-w-10xl space-y-4 border-2 bg-white p-6 md:p-12">
                <div className="container m-auto relative text-left prose-2xl">
                  <button
                    type="button"
                    className="absolute top-0 right-0 z-50"
                    aria-label="Close"
                    onClick={() => setShowSizeGuideModal(false)}
                  >
                    <XMarkIcon className="w-10 h-10 text-gray-900 bg-gray-100 border border-gray-900 hover:text-red-900 hover:border-red-900" />
                  </button>
                  <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
                  {sizeGuide.page.attributes &&
                    sizeGuide.page.attributes.map(
                      (attr: {
                        attribute: { name: React.Key | null | undefined };
                        values: { name: any }[];
                      }) => (
                        <Image
                          key={attr?.attribute.name}
                          src={`${UPLOAD_FOLDER ?? ""}/${attr?.values?.[0]?.name ?? ""}`}
                          alt={sizeGuide.page.title}
                          width={1200}
                          height={400}
                          style={{ objectFit: "contain", padding: "4rem 0" }}
                          priority={false}
                          loading="lazy"
                        />
                      ),
                    )}
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import HtmlContent from "../HtmlContent";

export default function Accordion({ data }: any) {
  return (
    <div className="container pb-14 mx-auto">
      <div className="mx-auto w-full divide-y divide-gray/5">
        {data.accordionElement &&
          data.accordionElement.length > 0 &&
          data.accordionElement.map((elem: any) => (
            <Disclosure as="div" key={elem.id}>
              <DisclosureButton className="group flex w-full items-center justify-between p-6">
                <span className="text-md font-bold group-data-[hover]:text-main-1 text-left">
                  {elem?.title}
                </span>
                <ChevronDownIcon className="size-5 fill-gray/60 group-data-[hover]:fill-gray/50 group-data-[open]:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-4 text-base">
                {elem.content && <HtmlContent htmlContent={elem.content as any} />}
              </DisclosurePanel>
            </Disclosure>
          ))}
      </div>
    </div>
  );
}

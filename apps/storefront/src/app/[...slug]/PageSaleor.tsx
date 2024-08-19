import React from "react";
import { PageFragment } from "@/saleor/api";
import edjsHTML from "editorjs-html";
import { translate } from "@/lib/translations";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
import xss from "xss";
import { STOREFRONT_URL } from "@/lib/const";
const edjsParser = edjsHTML();

type Props = {
  page: PageFragment;
};
export default function PageSaleor({ page }: Props) {
  const content = page && "content" in page ? translate(page, "content") : null;
  const parsedContent = content ? edjsParser.parse(JSON.parse(content)).join("") : "";
  const richTextAttributes =
    page && "attributes" in page
      ? page.attributes.filter((attr) => attr.attribute.inputType === "RICH_TEXT")
      : [];

  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: translate(page, "title") }];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href ? `${STOREFRONT_URL}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <Script
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <header className="mb-4 border-main-6">
        <div className="bg-main-7 border-b md:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </header>
      <main className="pt-6 px-8 pb-12 prose-2xl container">
        <h1 className="text-4xl font-bold pb-6" data-testid={`titleOf${page.title}`}>
          {page.title}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: xss(parsedContent) }} />
        {richTextAttributes && richTextAttributes.length > 0 && (
          <div className="container flex flex-col md:flex-row">
            {richTextAttributes.map((attr, index) =>
              attr.values.map((item) => {
                const parsedRichText = item.richText
                  ? edjsParser.parse(JSON.parse(item.richText)).join("")
                  : "";
                if (parsedRichText) {
                  return (
                    <div key={`${index}`} className="md:w-1/2 p-4 border-t border-gray-300 py-20">
                      <div
                        className="p-2"
                        dangerouslySetInnerHTML={{ __html: xss(parsedRichText) }}
                      />
                    </div>
                  );
                }
              }),
            )}
          </div>
        )}
      </main>
    </>
  );
}

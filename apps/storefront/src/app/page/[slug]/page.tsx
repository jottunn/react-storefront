import React from "react";
import { defaultRegionQuery } from "@/lib/regions";
import { LanguageCodeEnum, PageDocument, PageQuery } from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { Metadata, ResolvingMetadata } from "next";
import edjsHTML from "editorjs-html";
import { translate } from "@/lib/translations";
import { notFound } from "next/navigation";
import Link from "next/link";
const parser = edjsHTML();

export const generateMetadata = async (
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const response = await executeGraphQL<
    PageQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(PageDocument, {
    variables: { slug: params.slug, ...defaultRegionQuery() },
    revalidate: 60,
  });
  const page = response.page;
  return {
    title: page && (page.seoTitle || page.title),
    description: page && page.seoDescription,
  };
};

export default async function Page({ params }: { params: { slug: string } }) {
  const { page } = await executeGraphQL<
    PageQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(PageDocument, {
    variables: {
      slug: params.slug,
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  if (!page) {
    notFound();
  }

  const content = page && "content" in page ? translate(page, "content") : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  const richTextAttributes =
    page && "attributes" in page
      ? page.attributes.filter((attr) => attr.attribute.inputType === "RICH_TEXT")
      : [];

  return (
    <>
      <header>
        <div className="bg-main-7 border-b mb-8">
          <div className="container flex gap-2 flex-wrap text-left py-4 px-8 ">
            <Link
              href="/"
              className="text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
            >
              Home
            </Link>{" "}
            <span className="text-gray-600 mt-2 text-base">/</span>
            <span className="text-sm mt-2 font-medium text-gray-400">
              {translate(page, "title")}
            </span>
          </div>
        </div>
      </header>
      <main className="pt-8 px-8 pb-12 prose-2xl">
        <div className="container">
          <h1 className="text-4xl font-bold" data-testid={`titleOf${page.title}`}>
            {page.title}
          </h1>
          <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
          {richTextAttributes && richTextAttributes.length > 0 && (
            <div className="container flex flex-col md:flex-row">
              {richTextAttributes.map((attr, index) =>
                attr.values.map((item) => {
                  const parsedRichText = item.richText
                    ? parser.parse(JSON.parse(item.richText)).join("")
                    : "";
                  if (parsedRichText) {
                    return (
                      <div key={`${index}`} className="md:w-1/2 p-4 border-t border-gray-300 py-20">
                        <div className="p-2" dangerouslySetInnerHTML={{ __html: parsedRichText }} />
                      </div>
                    );
                  }
                }),
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

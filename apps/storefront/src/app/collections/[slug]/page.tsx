import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { executeGraphQL } from "src/lib/graphql";
import { CollectionBySlugDocument, CollectionBySlugQuery, LanguageCodeEnum } from "@/saleor/api";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import PageHero from "@/components/PageHero";
import { translate } from "@/lib/translations";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { getMessages } from "@/lib/util";
import Link from "next/link";

export const generateMetadata = async (
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const response = await executeGraphQL<
    CollectionBySlugQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(CollectionBySlugDocument, {
    variables: { slug: params.slug, ...defaultRegionQuery() },
    revalidate: 60,
  });
  const collection = response.collection;

  //TODOcreate a generic description if seodescription is missing - use children
  //create a geneirc title if seotitle is missing
  //add image and other meta
  return {
    title: collection && (collection.seoTitle || collection.name),
    description: collection && collection.seoDescription,
  };
};

export default async function Page({ params }: { params: { slug: string } }) {
  const { collection } = await executeGraphQL<
    CollectionBySlugQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(CollectionBySlugDocument, {
    variables: { slug: params.slug, ...defaultRegionQuery() },
    revalidate: 60,
  });

  if (!collection) {
    notFound();
  }
  const messages = getMessages(DEFAULT_LOCALE);

  return (
    <>
      <header className="mb-4 border-b border-main-6">
        <div className="bg-main-7 border-b mb-8">
          <div className="container flex gap-2 flex-wrap text-left py-4 px-8 ">
            <Link
              href="/"
              className="text-xs md:text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
            >
              Home
            </Link>{" "}
            <span className="text-gray-600 md:mt-2 text-base">/</span>
            <span className="text-xs md:text-sm mt-2 font-medium text-gray-400">
              {translate(collection, "name")}
            </span>
          </div>
        </div>
        <div className="container px-8 p-4">
          <PageHero
            title={translate(collection, "name")}
            description={translate(collection, "description") || ""}
          />
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-40">
          <FilteredProductList collectionIDs={[collection.id]} messages={messages} />
        </div>
      </main>
    </>
  );
}

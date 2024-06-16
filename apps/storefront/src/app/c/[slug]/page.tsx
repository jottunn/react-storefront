import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { executeGraphQL } from "src/lib/graphql";
import { CategoryBySlugDocument, CategoryBySlugQuery, LanguageCodeEnum } from "@/saleor/api";
import { DEFAULT_LOCALE } from "@/lib/regions";
import PageHero from "@/components/PageHero";
import { translate } from "@/lib/translations";
import { mapEdgesToItems } from "@/lib/maps";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { getMessages } from "@/lib/util";
import { Fragment } from "react";
import Link from "next/link";

export const generateMetadata = async (
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const response = await executeGraphQL<any, { slug: string; locale: LanguageCodeEnum }>(
    CategoryBySlugDocument,
    {
      variables: { slug: params.slug, locale: DEFAULT_LOCALE },
      revalidate: 60,
    },
  );
  const category = response.category;

  //TODOcreate a generic description if seodescription is missing - use children
  //create a geneirc title if seotitle is missing
  //add image and other meta
  return {
    title: category && (category.seoTitle || category.name),
    description: category && category.seoDescription,
  };
};

export default async function Page({ params }: { params: { slug: string } }) {
  const { category } = await executeGraphQL<
    CategoryBySlugQuery,
    { slug: string; locale: LanguageCodeEnum }
  >(CategoryBySlugDocument, {
    variables: { slug: params.slug, locale: DEFAULT_LOCALE },
    revalidate: 60,
  });

  if (!category) {
    notFound();
  }
  const messages = getMessages(DEFAULT_LOCALE);
  const parentCategories = mapEdgesToItems(category?.ancestors);
  const subcategories = mapEdgesToItems(category?.children);
  const parents = parentCategories.map((parentCategory) => ({
    label: translate(parentCategory, "name"),
    slug: parentCategory.slug,
  }));

  return (
    <>
      <header className="border-b border-main-6">
        <div className="bg-main-7 border-b mb-8">
          <div className="container flex gap-2 flex-wrap text-left py-4 px-8 ">
            <Link
              href="/"
              className="text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
            >
              Home
            </Link>{" "}
            <span className="text-gray-600 mt-2 text-base">/</span>
            {parents.map((parent, i) => (
              <Fragment key={parent.slug}>
                <Link
                  href={`/c/${parent.slug}`}
                  className="text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
                >
                  {parent.label}
                </Link>
                <span className="text-gray-600 mt-2 text-base">/</span>
              </Fragment>
            ))}
            <span className="text-sm mt-2 font-medium text-gray-400">
              {translate(category, "name")}
            </span>
          </div>
        </div>
        <div className="container px-8 p-4">
          <PageHero
            title={translate(category, "name")}
            description={translate(category, "description") || ""}
            pills={subcategories.map((subcategory) => ({
              label: translate(subcategory, "name"),
              slug: subcategory.slug,
            }))}
            parents={parents}
          />
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-40">
          <FilteredProductList categoryIDs={[category.id]} messages={messages} />
        </div>
      </main>
    </>
  );
}

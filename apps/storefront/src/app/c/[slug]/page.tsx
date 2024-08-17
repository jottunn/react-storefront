import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { executeGraphQL } from "src/lib/graphql";
import { CategoryBySlugDocument, CategoryBySlugQuery, LanguageCodeEnum } from "@/saleor/api";
import { DEFAULT_LOCALE } from "@/lib/regions";
import PageHero from "@/components/PageHero";
import { translate } from "@/lib/translations";
import { mapEdgesToItems } from "@/lib/maps";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { getMessages, getOrderValue } from "@/lib/util";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | []> => {
  let category;
  try {
    const response = await executeGraphQL<any, { slug: string; locale: LanguageCodeEnum }>(
      CategoryBySlugDocument,
      {
        variables: { slug: params.slug, locale: DEFAULT_LOCALE },
        revalidate: 60 * 60 * 24,
      },
    );
    category = response.category;
  } catch {
    return [];
  }

  return {
    title: category && (category.seoTitle || `${category.name} | ${STOREFRONT_NAME}`),
    description:
      category && (category.seoDescription || `${category.name} pe magazinul online Surmont.ro`),
    alternates: {
      canonical: STOREFRONT_URL
        ? STOREFRONT_URL + `/c/${encodeURIComponent(params.slug)}`
        : undefined,
    },
    openGraph: {
      title: category && (category.seoTitle || `${category.name} | ${STOREFRONT_NAME}`),
      description:
        category && (category.seoDescription || `${category.name} pe magazinul online Surmont.ro`),
      images: category &&
        category.backgroundImage && [
          {
            url: category.backgroundImage.url,
            width: "670",
            height: "425",
            alt: category.backgroundImage.alt || category.name,
          },
        ],
    },
  };
};

export default async function Page({ params }: { params: { slug: string } }) {
  let category;
  try {
    const response = await executeGraphQL<
      CategoryBySlugQuery,
      { slug: string; locale: LanguageCodeEnum }
    >(CategoryBySlugDocument, {
      variables: { slug: params.slug, locale: DEFAULT_LOCALE },
      revalidate: 60,
    });
    category = response.category;
  } catch {
    return [];
  }
  if (!category) {
    notFound();
  }
  const messages = getMessages(DEFAULT_LOCALE);
  const parentCategories = mapEdgesToItems(category?.ancestors);
  const subcategories = mapEdgesToItems(category?.children);
  subcategories.sort((a, b) => getOrderValue(a.metadata) - getOrderValue(b.metadata));

  const parents = parentCategories.map((parentCategory) => ({
    label: translate(parentCategory, "name"),
    slug: parentCategory.slug,
  }));

  const breadcrumbItems = [{ name: "Home", href: "/" }];
  parents.forEach((parent) => {
    breadcrumbItems.push({
      name: parent.label,
      href: `/c/${parent.slug}`,
    });
  });
  breadcrumbItems.push({ name: translate(category, "name"), href: "" });
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
      <header className="border-b border-main-6">
        <div className="bg-main-7 border-b md:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="container px-8 p-4">
          <PageHero
            title={translate(category, "name")}
            description={translate(category, "description") || ""}
            pills={subcategories.map((subcategory) => ({
              label: translate(subcategory, "name"),
              slug: subcategory.slug,
            }))}
            messages={messages}
          />
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-12 md:mb-40 min-h-[600px]">
          <FilteredProductList categoryIDs={[category.id]} messages={messages} />
        </div>
      </main>
    </>
  );
}

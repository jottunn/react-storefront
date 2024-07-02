import { STOREFRONT_NAME } from "@/lib/const";
import { getPageBySlug } from "@/lib/strapi/get-page-by-slug";
import { Metadata } from "next";
import { executeGraphQL } from "@/lib/graphql";
import { LanguageCodeEnum, PageDocument, PageFragment, PageQuery } from "@/saleor/api";
import PageSaleor from "./PageSaleor";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import PageStrapi from "./PageStrapi";
import { notFound } from "next/navigation";

type Props = {
  params: {
    lang: string;
    slug: string;
  };
};

const isValidSlug = (slug: string): boolean => {
  const invalidPatterns = [
    /^\./, // Starts with a dot (hidden/system files)
    /\.(env|example|json|js|ts|tsx|md|html|css|scss|png|jpg|jpeg|gif|svg|ico)$/, // Ends with specific file extensions
  ];

  return !invalidPatterns.some((pattern) => pattern.test(slug));
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const currentSlug = params.slug[params.slug.length - 1];
  if (!isValidSlug(currentSlug)) {
    console.warn("Invalid slug attempt:", currentSlug);
    return notFound();
  }
  try {
    const saleorPage = await executeGraphQL<
      PageQuery,
      { slug: string; locale: LanguageCodeEnum; channel: string }
    >(PageDocument, {
      variables: {
        slug: currentSlug,
        ...defaultRegionQuery(),
      },
      revalidate: 60,
    });
    if (saleorPage.page) {
      return {
        title: saleorPage.page.seoTitle || `${saleorPage.page.title} | ${STOREFRONT_NAME}`,
        description: saleorPage.page.seoDescription || `${saleorPage.page.title} - Surmont.ro`,
      };
    }
  } catch (error) {
    console.error("Failed to fetch saleor page:", error);
  }

  try {
    const strapiPage = await getPageBySlug(params.slug, params.lang);

    if (strapiPage.data && strapiPage.data.length === 0) return notFound();

    if (strapiPage.data && strapiPage.data[0] && !strapiPage.data[0].attributes?.seo) {
      return {
        title: `${strapiPage.data[0].attributes.pageName} | ${STOREFRONT_NAME}`,
        description: `${strapiPage.data[0].attributes.pageName} - Surmont.ro`,
      };
    } else {
      const metadata = strapiPage.data[0] && strapiPage.data[0].attributes.seo;
      return {
        title: metadata && metadata.metaTitle,
        description: metadata && metadata.metaDescription,
      };
    }
  } catch (error) {
    console.error("Failed to fetch strapi page:", error);
    return notFound();
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const currentSlug = params.slug[params.slug.length - 1];
  if (!isValidSlug(currentSlug)) {
    console.warn("Invalid slug attempt:", currentSlug);
    return notFound();
  }
  const saleorPage = await executeGraphQL<
    PageQuery,
    { slug: string; locale: LanguageCodeEnum; channel: string }
  >(PageDocument, {
    variables: {
      slug: currentSlug,
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  if (saleorPage.page) {
    return <PageSaleor page={saleorPage.page as PageFragment} />;
  }

  const strapiPage = await getPageBySlug(params.slug, DEFAULT_LOCALE);
  if (strapiPage.data && strapiPage.data.length === 0) return notFound();
  return <PageStrapi page={strapiPage} />;
}

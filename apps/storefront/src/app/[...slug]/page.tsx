import { STOREFRONT_NAME } from "@/lib/const";
import { getPageBySlug } from "@/lib/strapi/get-page-by-slug";
import { Metadata } from "next";
import { executeGraphQL } from "@/lib/graphql";
import { LanguageCodeEnum, PageDocument, PageFragment, PageQuery } from "@/saleor/api";
import PageSaleor from "./PageSaleor";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import PageStrapi from "./PageStrapi";

type Props = {
  params: {
    lang: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const currentSlug = params.slug[params.slug.length - 1];
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
  const strapiPage = await getPageBySlug(params.slug, params.lang);

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
}

export default async function Page({ params }: { params: { slug: string } }) {
  const currentSlug = params.slug[params.slug.length - 1];
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

  const page = await getPageBySlug(params.slug, DEFAULT_LOCALE);
  if (page.data && page.data.length === 0) return null;
  return <PageStrapi page={page} />;
}

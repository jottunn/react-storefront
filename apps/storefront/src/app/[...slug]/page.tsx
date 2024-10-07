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

// Slug validation function to ensure it's a valid URL part
const isValidSlug = (slug: string): boolean => {
  const invalidPatterns = [
    /^\./, // Prevents slugs starting with a dot
    /\.(env|example|json|js|ts|tsx|md|html|css|scss|png|php|php5|jpg|jpeg|gif|git|svg|ico|map|world|txt|yaml|bak|prod|production)$/, // Block specific file types
    /cgi-bin|luci|admin|cdn-cgi|phpsysinfo|php-cgi/, // Block specific directory paths
  ];
  return !invalidPatterns.some((pattern) => pattern.test(slug));
};

// Helper function to fetch page data from Saleor or Strapi
async function fetchPageData(slug: string, lang: string) {
  try {
    const saleorPage = await executeGraphQL<
      PageQuery,
      { slug: string; locale: LanguageCodeEnum; channel: string }
    >(PageDocument, {
      variables: {
        slug,
        ...defaultRegionQuery(),
      },
      revalidate: 60 * 5,
      withAuth: false,
    });

    // If a Saleor page is found, return it
    if (saleorPage && saleorPage.page) {
      return { saleorPage: saleorPage.page };
    }
  } catch (error) {
    console.error("Failed to fetch Saleor page:", error);
  }

  // If no Saleor page, try fetching from Strapi
  try {
    const strapiPage = await getPageBySlug(slug, lang);
    if (strapiPage && strapiPage.data.length > 0) {
      return { strapiPage };
    }
  } catch (error) {
    console.error("Failed to fetch Strapi page:", error);
  }

  // Return null if no page is found
  return null;
}

// Generate Metadata based on the fetched page data
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const currentSlug = params.slug[params.slug.length - 1];
  const lang = params.lang;

  // Validate the slug before fetching data
  if (!isValidSlug(currentSlug)) {
    console.warn("Invalid slug attempt:", currentSlug);
    return notFound();
  }

  // Fetch the page data from Saleor or Strapi
  const pageData = await fetchPageData(currentSlug, lang);
  if (!pageData) return notFound(); // Return 404 if no page is found

  // If Saleor page is found, use Saleor metadata
  if (pageData.saleorPage) {
    return {
      title: pageData.saleorPage.seoTitle || `${pageData.saleorPage.title} | ${STOREFRONT_NAME}`,
      description:
        pageData.saleorPage.seoDescription || `${pageData.saleorPage.title} - Surmont.ro`,
    };
  }

  // If Strapi page is found, use Strapi metadata
  const strapiPage = pageData.strapiPage;
  const seo = strapiPage?.data[0].attributes.seo;
  const pageName = strapiPage?.data[0].attributes.pageName;

  return {
    title: seo?.metaTitle || `${pageName} | ${STOREFRONT_NAME}`,
    description: seo?.metaDescription || `${pageName} - Surmont.ro`,
  };
}

// The main Page component that renders content from Saleor or Strapi
export default async function Page({ params }: { params: { slug: string } }) {
  const currentSlug = params.slug[params.slug.length - 1];
  const lang = DEFAULT_LOCALE;

  // Validate the slug before fetching data
  if (!isValidSlug(currentSlug)) {
    console.warn("Invalid slug attempt:", currentSlug);
    return notFound();
  }

  // Fetch the page data from Saleor or Strapi
  const pageData = await fetchPageData(currentSlug, lang);
  if (!pageData) return notFound(); // Return 404 if no page is found

  // If Saleor page is found, render Saleor page component
  if (pageData.saleorPage) {
    return <PageSaleor page={pageData.saleorPage as PageFragment} />;
  }

  // If Strapi page is found, render Strapi page component
  const strapiPage = pageData.strapiPage;
  return <PageStrapi page={strapiPage} />;
}

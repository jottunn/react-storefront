import Breadcrumbs from "@/components/Breadcrumbs";
import { BlogItem } from "@/components/strapi/blog/BlogItem";
import { BlogPagination } from "@/components/strapi/blog/BlogPagination";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getCollectionBySlug } from "@/lib/strapi/get-collection-by-slug";
import { notFound } from "next/navigation";
import Script from "next/script";

const ITEMS_PER_PAGE = 10;

async function fetchPageData(collectionSlug: string, lang: string, page: number) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  try {
    const populate = {
      coverImage: { populate: "*" },
      categories: { populate: "*" },
    };
    const blogs = await getCollectionBySlug(
      collectionSlug,
      lang,
      start,
      ITEMS_PER_PAGE,
      {},
      populate,
    );

    if (blogs) {
      return { blogs };
    }
  } catch (error) {
    console.error("Failed to fetch Strapi page:", error);
  }

  return null;
}

export const metadata = {
  title: `Blog | ${STOREFRONT_NAME}`,
  description:
    "Descoperă cele mai noi articole din blogul nostru, pline de inspirație, sfaturi și ghiduri utile pe o varietate de subiecte.",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/blog` : undefined,
  },
};

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const lang = DEFAULT_LOCALE;
  const currentPage = Number(searchParams.page) || 1;

  const displayBlogs = await fetchPageData("blogs", lang, currentPage);
  if (!displayBlogs) return notFound();

  const { data, meta } = displayBlogs.blogs;
  const totalPages = Math.ceil(meta.pagination.total / ITEMS_PER_PAGE);
  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: "Blog" }];

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
      <main className="pt-6 px-8 pb-12 text-base container">
        <h1 className="text-xl uppercase mb-12">Blog</h1>
        <div>
          {data.map(
            (
              blog: any, //strapi5 remove attributes
            ) => (
              <BlogItem blog={blog} key={blog.attributes.slug} />
            ),
          )}
        </div>
        <BlogPagination currentPage={currentPage} totalPages={totalPages} />
      </main>
    </>
  );
}

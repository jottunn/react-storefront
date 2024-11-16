import Breadcrumbs from "@/components/Breadcrumbs";
import { BlogItem } from "@/components/strapi/blog/BlogItem";
import { BlogPagination } from "@/components/strapi/blog/BlogPagination";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getCollectionBySlug } from "@/lib/strapi/get-collection-by-slug";
import { notFound } from "next/navigation";
import Script from "next/script";

const ITEMS_PER_PAGE = 10;

async function fetchPageData(collectionSlug: string, lang: string, page: number, filter: string) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  try {
    const populate = {
      coverImage: { populate: "*" },
      categories: { populate: "*" },
      tags: { populate: "*" },
    };
    const filters = {
      tags: {
        slug: filter,
      },
    };
    const blogs = await getCollectionBySlug(
      collectionSlug,
      lang,
      start,
      ITEMS_PER_PAGE,
      filters,
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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const displayBlogs = await fetchPageData("blogs", DEFAULT_LOCALE, 1, params.slug);
  if (!displayBlogs || displayBlogs.blogs.data.length === 0) return notFound();

  const { data } = displayBlogs.blogs;
  //strapi5 let cuurentTag = data[0]["tags"].filter((tag: any) => tag.slug === params.slug);
  //strapi5 cuurentTag = cuurentTag[0];
  let cuurentTag = data[0]["attributes"]["tags"]["data"].filter(
    (tag: any) => tag.attributes.slug === params.slug,
  );
  cuurentTag = cuurentTag[0]["attributes"];
  const title = `${cuurentTag.title} | ${STOREFRONT_NAME}`;
  const description = `Descoperă o selecție de articole etichetate cu ${cuurentTag.title} pe surmont.ro`;

  return {
    title,
    description,
  };
}

export default async function Page({ params }: { params: { slug: string; page: number } }) {
  const currentPage = Number(params.page) || 1;
  const displayBlogs = await fetchPageData("blogs", DEFAULT_LOCALE, currentPage, params.slug);
  if (!displayBlogs || displayBlogs.blogs.data.length === 0) return notFound();

  const { data, meta } = displayBlogs.blogs;
  let cuurentTag = data[0]["attributes"]["tags"]["data"].filter(
    (tag: any) => tag.attributes.slug === params.slug,
  );
  cuurentTag = cuurentTag[0]["attributes"];

  const totalPages = Math.ceil(meta?.pagination?.total / ITEMS_PER_PAGE);
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: cuurentTag.title || "" },
  ];
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
        <h1 className="text-xl uppercase mb-12">Blog // {cuurentTag.title || ""}</h1>
        <div>
          {data.map((blog: any) => (
            <BlogItem blog={blog} key={blog.attributes.slug} /> //strapi5 remove attributes
          ))}
        </div>
        <BlogPagination currentPage={currentPage} totalPages={totalPages} />
      </main>
    </>
  );
}

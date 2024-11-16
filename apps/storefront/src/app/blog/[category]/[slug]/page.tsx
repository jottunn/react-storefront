import Breadcrumbs from "@/components/Breadcrumbs";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import { getStrapiMedia } from "@/lib/strapi/api-helpers";
import { getCollectionBySlug } from "@/lib/strapi/get-collection-by-slug";
import { sectionRenderer } from "@/lib/strapi/section-renderer";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { getMessages } from "@/lib/util";

async function fetchSinglePageData(
  collectionSlug: string,
  lang: string,
  queryFilters: {},
  currentSlug: string,
) {
  try {
    const populate = {
      coverImage: { populate: "*" },
      author: { fields: ["name"] },
      categories: { fields: ["title", "slug"] },
      tags: { fields: ["title", "slug"] },
      postContent: { populate: "*" },
    };
    const blogPage = await getCollectionBySlug(collectionSlug, lang, 0, 10, queryFilters, populate);
    let blogCategories = blogPage.data[0].attributes.categories.data; //strapi5 let blogCategories = blogPage.data[0].categories;
    blogCategories =
      (blogCategories && blogCategories.map((category: any) => category.attributes.slug)) || []; //strapi5, remove attributes
    const relatedArticles = await getCollectionBySlug(
      collectionSlug,
      lang,
      0,
      3,
      {
        categories: {
          slug: {
            $in: blogCategories.length > 0 ? blogCategories : ["bikes"],
          },
        },
        slug: {
          $ne: currentSlug,
        },
      },
      populate,
    );

    if (blogPage) {
      return { blogPage, relatedArticles };
    }
  } catch (error) {
    console.error("Failed to fetch Strapi page:", error);
  }

  return null;
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }) {
  const { slug } = params;
  const blog = await fetchSinglePageData("blogs", DEFAULT_LOCALE, { slug }, slug);

  if (!blog || blog.blogPage.data.length === 0) {
    return notFound();
  }

  const article = blog.blogPage.data[0].attributes; //strapi 5, remove attributes
  const title = `${article.title} | ${STOREFRONT_NAME}`;
  const description = article.excerpt || "";
  const coverImage = article.coverImage.data?.attributes; //strapi5   const coverImage = article.coverImage;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${STOREFRONT_URL}/blog/${params.category}/${slug}`,
      images: [
        {
          url: getStrapiMedia(coverImage.url) || "",
          alt: coverImage.alternativeText || "",
        },
      ],
    },
  };
}

export default async function Page({ params }: { params: { category: string; slug: string } }) {
  const slug = params.slug;
  const messages = getMessages(defaultRegionQuery().locale, "app.blog");
  // Fetch the page data from Saleor or Strapi
  const blog = await fetchSinglePageData("blogs", DEFAULT_LOCALE, { slug }, slug);
  if (!blog || blog.blogPage.data.length === 0) return notFound();
  //strapi5 remove attributes and data
  const article = blog.blogPage.data[0].attributes;
  const postContent = article?.postContent;
  const authors = article?.author?.data;
  const categories = article?.categories?.data;
  const tags = article?.tags?.data;
  const coverImage = article?.coverImage?.data?.attributes;
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    {
      name: categories && categories.length > 0 ? categories[0]["attributes"]["title"] : "Bikes",
      href:
        categories && categories.length > 0
          ? `/blog/${categories[0]["attributes"]["slug"]}`
          : "/blog/bikes",
    },
    { name: article?.title },
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
  const imgUrl = getStrapiMedia(coverImage?.url);
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
      <main className="pt-6 pb-12 text-base space-y-8 container m-auto">
        <div className="px-8 md:max-w-[70%] m-auto space-y-6 pb-8 md:pb-24">
          <div className="flex space-x-4">
            <div className="p-2">
              {categories &&
                categories.map((category: any) => (
                  <Link href={`/blog/${category.attributes.slug}`} className="hover:text-action-1">
                    <span className="bg-gray-200 p-2 mr-4">{category.attributes.title}</span>
                  </Link>
                ))}
            </div>
            <div className="p-2">{authors.map((author: any) => author.attributes.name)}</div>
          </div>
          <h1 className="text-xl pt-4">{article.title}</h1>
          <p>{article.excerpt}</p>
        </div>
        <div className="w-full">
          <Image
            src={imgUrl || ""}
            alt={coverImage.alternativeText || ""}
            priority={true}
            sizes="(max-width: 640px) 100vw, 100vw"
            width={1500}
            height={800}
            className="w-full"
          />
        </div>
        <div className="px-8 md:max-w-[70%] m-auto pt-8 md:pt-24">
          {postContent &&
            postContent.length > 0 &&
            postContent.map((section: any, index: number) => sectionRenderer(section, index))}
        </div>
        <div className="px-8 md:max-w-[70%] m-auto pb-12">
          {tags &&
            tags.map((tag: any) => (
              <Link href={`/blog/tags/${tag.attributes.slug}`} className="hover:text-action-1">
                <span className="p-2 mr-4 font-bold">#{tag.attributes.title}</span>
              </Link>
            ))}
        </div>

        {blog.relatedArticles &&
          blog.relatedArticles.data.length > 0 && ( //strapi5  remove data, attributes
            <>
              <hr />
              <div className="m-auto py-12">
                <h2 className="text-lg uppercase pb-12">{messages["app.blog.related"]}</h2>
                <div className="grid md:grid-cols-3 md:gap-10">
                  {blog.relatedArticles.data.map((related: any, index: any) => {
                    if (related.attributes.slug !== slug) {
                      const relatedImgUrl = getStrapiMedia(
                        related.attributes.coverImage.data.attributes.url,
                      );
                      const relatedCategory = related.attributes.categories.data[0];
                      return (
                        <>
                          <Link
                            href={`/blog/${relatedCategory.attributes.slug || "bikes"}/${related.attributes.slug}`}
                            key={`related${index}`}
                          >
                            <div className="space-y-4 mb-12 hover:text-gray-700">
                              <Image
                                src={relatedImgUrl || ""}
                                alt={
                                  related.attributes.coverImage.data.attributes.alternativeText ||
                                  ""
                                }
                                priority={false}
                                loading="lazy"
                                className="hover:brightness-125 hover:contrast-115 transition-all duration-30"
                                sizes="(max-width: 640px) 100vw, 100vw"
                                width={500}
                                height={400}
                              />
                              <h3 className="text-md font-bold">{related.attributes.title}</h3>
                              <p className="text-base">{related.attributes.excerpt}</p>
                            </div>
                          </Link>
                        </>
                      );
                    }
                  })}
                </div>
              </div>
            </>
          )}
      </main>
    </>
  );
}

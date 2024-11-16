import Breadcrumbs from "@/components/Breadcrumbs";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getCollectionBySlug } from "@/lib/strapi/get-collection-by-slug";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

const ITEMS_PER_PAGE = 10;

async function fetchPageData(collectionSlug: string, lang: string, page: number) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  try {
    const tags = await getCollectionBySlug(collectionSlug, lang, start, ITEMS_PER_PAGE, {});
    if (tags) {
      return { tags };
    }
  } catch (error) {
    console.error("Failed to fetch Strapi page:", error);
  }
  return null;
}

export const metadata = {
  title: `Tags | ${STOREFRONT_NAME}`,
  description:
    "Explorează toate articolele organizate pe etichete. Găsește rapid conținut relevant pe o varietate de subiecte.",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/blog/tags` : undefined,
  },
};

export default async function Page() {
  const lang = DEFAULT_LOCALE;
  const displayedTags = await fetchPageData("tags", lang, 1);
  if (!displayedTags) return notFound();

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Tags" },
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
        <h1 className="text-xl uppercase mb-12">Tags</h1>
        <div>
          {displayedTags.tags?.data?.map((tag: any) => {
            //strapi5 remove attributes
            return (
              <Link
                href={`/blog/tags/${tag.attributes.slug}`}
                key={tag.attributes.slug}
                className="hover:underline hover:text-action-1 p-2 inline-block"
              >
                <p className="text-md inline-block">#{tag.attributes.title}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}

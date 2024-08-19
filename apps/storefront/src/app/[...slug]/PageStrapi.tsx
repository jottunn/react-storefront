import Breadcrumbs from "@/components/Breadcrumbs";
import { STOREFRONT_URL } from "@/lib/const";
import { sectionRenderer } from "@/lib/strapi/section-renderer";
import Script from "next/script";

export default function PageStrapi({ page }: any) {
  const pageContent = page.data[0].attributes.pageContent;
  const pageTitle = page.data[0].attributes.pageName;
  const breadcrumbItems = [{ name: "Home", href: "/" }, { name: pageTitle }];
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
  // console.log(pageContent);
  const hasHeroComponent = pageContent.filter(
    (section: { __component: string }) => section.__component === "sections.hero",
  );
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
        {!hasHeroComponent && (
          <h1 className="text-4xl font-bold pb-8" data-testid={`titleOf${pageTitle}`}>
            {pageTitle}
          </h1>
        )}
        {pageContent.map((section: any, index: number) => sectionRenderer(section, index))}
      </main>
    </>
  );
}

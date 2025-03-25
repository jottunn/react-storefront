import { getMessages, getMetadataValue, getNumColumns, getOrderValue } from "src/lib/util";
import { DEFAULT_LOCALE, defaultRegionQuery } from "src/lib/regions";
import { executeGraphQL } from "@/lib/graphql";
import {
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  LanguageCodeEnum,
  PageDocument,
  PageQuery,
  PageTypesDocument,
  PageTypesQuery,
  Product,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
  ProductOrder,
} from "@/saleor/api";
import { mapEdgesToItems } from "@/lib/maps";
import { Metadata } from "next";
import { PAGE_TYPE_HP_BANNERS_ID, STOREFRONT_NAME, UPLOAD_FOLDER } from "@/lib/const";
import { translate } from "@/lib/translations";
import edjsHTML from "editorjs-html";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SwiperComponent from "@/components/SwiperComponent";
import HomepageBlock from "@/components/homepage/HomepageBlock";
import getBase64 from "@/lib/generateBlurPlaceholder";
import Banner from "@/components/homepage/Banner";
import Link from "next/link";
import Image from "next/image";

const parser = edjsHTML();
const emptyTagsRegex = /^<[^>]+>\s*(<br\s*\/?>)?\s*<\/[^>]+>$/;
export const generateMetadata = async (): Promise<Metadata | []> => {
  let page;
  try {
    const response = await executeGraphQL<PageQuery, { slug: String; locale: LanguageCodeEnum }>(
      PageDocument,
      {
        variables: { slug: "home", locale: DEFAULT_LOCALE },
        revalidate: 60 * 5,
      },
    );
    page = response.page;
  } catch {
    //return [];
  }

  return {
    title: page && (page.seoTitle || STOREFRONT_NAME),
    description: page && (page.seoDescription || "Premium bike store for Trek, Bontrager, ION"),
  };
};

export default async function Home() {
  "use server";
  const messages = getMessages(DEFAULT_LOCALE);
  //get page by slug home
  let page;
  try {
    const response = await executeGraphQL<PageQuery, { slug: String; locale: LanguageCodeEnum }>(
      PageDocument,
      {
        variables: { slug: "home", locale: DEFAULT_LOCALE },
        revalidate: 60 * 5,
      },
    );
    page = response.page;
  } catch {
    //return [];
  }
  const filter: ProductFilterInput = { isPublished: true, stockAvailability: "IN_STOCK" };
  const sortBy: ProductOrder = { direction: "DESC", field: "PUBLICATION_DATE" };
  const queryVariables = {
    filter,
    first: 10,
    ...defaultRegionQuery(),
    sortBy,
  };
  const displayNewProducts =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Display Noutati") : "";
  let newProducts;
  if (displayNewProducts === "YES") {
    let newProductsH;
    try {
      const response = await executeGraphQL<ProductCollectionQuery, { filter: any }>(
        ProductCollectionDocument,
        {
          variables: queryVariables,
          revalidate: 60 * 60,
        },
      );
      newProductsH = response.products;
    } catch {
      //return [];
    }
    newProducts = newProductsH ? mapEdgesToItems(newProductsH) : [];
  }

  /** get banners to be displayed on homepage - content-type = banner */
  let homepageBanners;
  try {
    const homepageBannersResponse = await executeGraphQL<
      PageTypesQuery,
      { filter: any; locale: LanguageCodeEnum }
    >(PageTypesDocument, {
      variables: { filter: { pageTypes: [PAGE_TYPE_HP_BANNERS_ID] }, locale: DEFAULT_LOCALE },
      revalidate: 60,
    });
    homepageBanners = homepageBannersResponse.pages;
  } catch {
    //return null;
  }
  const displayHomepageBanners = homepageBanners ? mapEdgesToItems(homepageBanners) : [];
  displayHomepageBanners.sort((a, b) => {
    const orderA = Number(
      a.attributes.find((attr) => attr.attribute.slug === "order")?.values[0]?.name || 0,
    );
    const orderB = Number(
      b.attributes.find((attr) => attr.attribute.slug === "order")?.values[0]?.name || 0,
    );

    return orderA - orderB;
  });
  const numColumnsHPBanners = getNumColumns(displayHomepageBanners.length);

  /** sales collections */
  let salesCollections;
  try {
    const result = await executeGraphQL<
      CollectionsByMetaKeyQuery,
      { filter: any; locale: LanguageCodeEnum; channel: string }
    >(CollectionsByMetaKeyDocument, {
      variables: {
        filter: {
          metadata: [{ key: "isSale", value: "YES" }],
          published: "PUBLISHED",
        },
        ...defaultRegionQuery(),
      },
      revalidate: 60 * 60 * 60,
    });
    salesCollections = result.collections;
  } catch {
    //return null;
  }
  const outletCollections = mapEdgesToItems(salesCollections);
  const outletCollectionsIds = outletCollections && outletCollections.map((collect) => collect.id);
  /** get 30 products from sales collection */
  let salesProducts;
  let displayedSalesProducts;
  if (outletCollectionsIds && outletCollectionsIds.length > 0) {
    const { products: salesProductsH } = await executeGraphQL<
      ProductCollectionQuery,
      { filter: any; sortBy: any; first: number; locale: string; channel: string }
    >(ProductCollectionDocument, {
      variables: {
        filter: {
          isPublished: true,
          stockAvailability: "IN_STOCK",
          collections: outletCollectionsIds,
        },
        first: 30,
        ...defaultRegionQuery(),
        sortBy,
      },
      revalidate: 60 * 60 * 60,
    });
    salesProducts = salesProductsH ? mapEdgesToItems(salesProductsH) : [];
    if (salesProducts && salesProducts.length > 0) {
      // Randomize the array using sort with a random comparator
      salesProducts.sort(() => Math.random() - 0.5);

      // Select only the first 6 products
      displayedSalesProducts = salesProducts.slice(0, 12);
    }
  }
  /** banner1 */
  const banner1Attribute =
    page && "attributes" in page
      ? page.attributes.find((attr) => attr.attribute.name === "Homepage Banner1")
      : null;

  // console.log('page.attributes', page?.attributes);
  const hasBanner1 = banner1Attribute?.values.length && banner1Attribute?.values.length > 0;
  // console.log('hasBanner1', hasBanner1);
  const banner1AttributeContent =
    page && "attributes" in page
      ? page.attributes.find(
          (attr) =>
            attr.attribute.inputType === "RICH_TEXT" &&
            attr.attribute.name === "Homepage Banner1 Content",
        )
      : null;
  const parsedBanner1RichText = banner1AttributeContent?.values[0].richText
    ? parser.parse(JSON.parse(banner1AttributeContent?.values[0].richText)).join("")
    : "";
  const bannerContainerSize =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Display Banner FullScreen") : "";
  const displayTextBanner1 =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Banner1 Text Display") : "";
  const banner1TextStyle =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Banner1 Text Style") : "";
  const banner1Link = page && "metadata" in page ? getMetadataValue(page.metadata, "Link1") : "";
  const base64 =
    banner1Attribute?.values[0]?.name &&
    (await getBase64(`${UPLOAD_FOLDER ?? ""}/${banner1Attribute.values[0].name}`));
  const placeholder = base64 || null;
  /** banner2 */
  const banner2Attribute =
    page && "attributes" in page
      ? page.attributes.find((attr) => attr.attribute.name === "Homepage Banner2")
      : null;
  const hasBanner2 = banner2Attribute?.values.length ? banner2Attribute?.values.length > 0 : false;
  let parsedBanner2RichText, displayTextBanner2, banner2TextStyle, placeholder_2, banner2Link;
  if (hasBanner2) {
    const banner2AttributeContent =
      page && "attributes" in page
        ? page.attributes.find(
            (attr) =>
              attr.attribute.inputType === "RICH_TEXT" &&
              attr.attribute.name === "Homepage Banner2 Content",
          )
        : null;
    parsedBanner2RichText = banner2AttributeContent?.values[0].richText
      ? parser.parse(JSON.parse(banner2AttributeContent?.values[0].richText)).join("")
      : "";
    displayTextBanner2 =
      page && "metadata" in page ? getMetadataValue(page.metadata, "Banner2 Text Display") : "";
    banner2TextStyle =
      page && "metadata" in page ? getMetadataValue(page.metadata, "Banner2 Text Style") : "";
    const base64_2 =
      banner2Attribute?.values[0]?.name &&
      (await getBase64(`${UPLOAD_FOLDER ?? ""}/${banner2Attribute.values[0].name}`));
    placeholder_2 = base64_2 || null;
    banner2Link = page && "metadata" in page ? getMetadataValue(page.metadata, "Link2") : "";
  }

  const content = page && "content" in page ? translate(page, "content") : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  const isEmptyContent = emptyTagsRegex.test(parsedContent);

  let brandCollections;
  try {
    brandCollections = await executeGraphQL<
      CollectionsByMetaKeyQuery,
      { filter: any; channel: string; locale: string }
    >(CollectionsByMetaKeyDocument, {
      variables: {
        filter: {
          metadata: [{ key: "isBrand", value: "YES" }],
          published: "PUBLISHED",
        },
        ...defaultRegionQuery(),
      },
      revalidate: 60 * 60 * 24,
    });
  } catch {
    //return null;
  }

  return (
    <>
      {hasBanner1 && (
        <div
          className={`flex overflow-hidden mb-1 md:mb-1 !px-0 ${bannerContainerSize && bannerContainerSize === "YES" ? "" : "max-w-[1920px] mx-auto"}`}
        >
          <div
            className={`flex flex-col w-full md:max-h-[80vh] ${hasBanner1 && hasBanner2 ? "h-auto md:w-[98%] mx-auto md:flex-row gap-4 md:gap-4" : ""} ${hasBanner1 && !hasBanner2 ? "h-[125vw]" : ""}`}
          >
            <Banner
              bannerAttribute={banner1Attribute}
              parsedBannerRichText={parsedBanner1RichText}
              displayTextBanner={displayTextBanner1}
              bannerTextStyle={banner1TextStyle}
              placeholder={placeholder}
              hasBanner2={hasBanner2}
              bannerLink={banner1Link}
            />
            {hasBanner2 && (
              <Banner
                bannerAttribute={banner2Attribute}
                parsedBannerRichText={parsedBanner2RichText}
                displayTextBanner={displayTextBanner2}
                bannerTextStyle={banner2TextStyle}
                placeholder={placeholder_2}
                hasBanner2={hasBanner2}
                bannerLink={banner2Link}
              />
            )}
          </div>
        </div>
      )}

      {parsedContent && !isEmptyContent && (
        <div className="container my-4 md:my-8 mx-auto max-w-[800px] text-center prose-2xl">
          <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
        </div>
      )}

      <div className="container block p-0">
        {displayHomepageBanners && displayHomepageBanners.length > 0 && (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${numColumnsHPBanners} gap-4 my-6`}
          >
            {displayHomepageBanners.map((banner) => (
              <HomepageBlock key={banner.id} item={banner} type="homepage" />
            ))}
          </div>
        )}
      </div>

      {displayedSalesProducts && displayedSalesProducts.length > 0 && (
        <div className="container py-4 md:pt-10 md:pb-24">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8 text-center">
              {messages["app.search.outletTitle"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button className="swiper-button-prev-sales custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="swiper-button-next-sales ew custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div>
            <SwiperComponent
              isLoop={true}
              products={displayedSalesProducts as Product[]}
              prevButtonClass="swiper-button-prev-sales"
              nextButtonClass="swiper-button-next-sales"
            />
          </div>
        </div>
      )}

      {displayNewProducts &&
        displayNewProducts === "YES" &&
        newProducts &&
        newProducts.length > 0 && (
          <div className="container py-4 md:pt-10 md:pb-24">
            <div className="swiper-header flex justify-center items-center space-x-4">
              <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8 text-center">
                {messages["app.newProducts"]}
              </h2>
              <div className="swiper-navigation flex mb-8">
                <button className="swiper-button-prev-new custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                  <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
                </button>
                <button className="swiper-button-next-new custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                  <ChevronRightIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div>
              <SwiperComponent
                isLoop={true}
                products={newProducts as Product[]}
                prevButtonClass="swiper-button-prev-new"
                nextButtonClass="swiper-button-next-new"
              />
            </div>
          </div>
        )}
      <div className="py-12 md:py-20 mb-10 items-center justify-items-center w-full border-t border-dark-300 md:min-h-[90px]">
        <div className="container md:flex flex-col gap-6 md:gap-12 lg:gap-20">
          {brandCollections &&
            (() => {
              const totalBrands = brandCollections.collections?.edges.length || 0;
              const remainder = totalBrands % 8;

              const numColumns = !totalBrands
                ? 8 // If no brands, default to 8 columns
                : remainder === 0
                  ? 8 // If remainder is 0, use 8 columns
                  : remainder <= 2
                    ? 6 // Remainder ≤ 2: 6 columns
                    : remainder <= 5
                      ? 7 // Remainder 3-5: 7 columns
                      : 8; // Otherwise: 8 columns
              const brandCollectionsRows = [];
              const brandCollectionsEdges = brandCollections.collections?.edges || [];

              for (let i = 0; i < brandCollectionsEdges.length; i += numColumns) {
                brandCollectionsRows.push(brandCollectionsEdges.slice(i, i + numColumns));
              }

              return brandCollectionsRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-4 md:flex md:justify-center gap-6 md:gap-12 lg:gap-20 items-center"
                >
                  {row.map((brand) => (
                    <Link
                      key={brand.node.slug}
                      href={`/collections/${brand.node.slug}`}
                      className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block"
                    >
                      {brand.node.backgroundImage ? (
                        <Image
                          src={brand.node.backgroundImage.url}
                          alt={brand.node.name}
                          width={200}
                          height={200}
                          className="hover:brightness-125 hover:contrast-115 transition-all duration-30"
                        />
                      ) : (
                        brand.node.name
                      )}
                    </Link>
                  ))}
                </div>
              ));
            })()}
        </div>
      </div>
    </>
  );
}

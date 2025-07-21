import { getMessages, getMetadataValue, getNumColumns } from "src/lib/util";
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
import {
  PAGE_TYPE_HP_BANNERS_ID,
  PAGE_TYPE_HP_CAROUSEL_ID,
  STOREFRONT_TITLE,
  UPLOAD_FOLDER,
} from "@/lib/const";
import { translate } from "@/lib/translations";
import edjsHTML from "editorjs-html";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SwiperComponent from "@/components/SwiperComponent";
import HomepageBlock from "@/components/homepage/HomepageBlock";
import Link from "next/link";
import Image from "next/image";
import MainBanner from "@/components/homepage/MainBanner";

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
    title: page && (page.seoTitle || STOREFRONT_TITLE),
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
  const sortBy: ProductOrder = { direction: "DESC", field: "PUBLICATION_DATE" };
  const displayNewProducts =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Display Noutati") : "";

  let newProducts;
  if (displayNewProducts === "YES") {
    let newProductsH;
    const newProductsCollectionId =
      page && "metadata" in page ? getMetadataValue(page.metadata, "Noutati Collection Id") : "";
    const filter: ProductFilterInput = {
      isPublished: true,
      stockAvailability: "IN_STOCK",
      ...(newProductsCollectionId && {
        collections: [newProductsCollectionId.replace(/%3D/g, "=").trim()],
      }),
    };
    const queryVariables = {
      filter,
      first: 20,
      ...defaultRegionQuery(),
      sortBy,
    };
    try {
      const response = await executeGraphQL<ProductCollectionQuery, { filter: any }>(
        ProductCollectionDocument,
        {
          variables: queryVariables,
          revalidate: 60 * 60 * 60,
        },
      );
      newProductsH = response.products;
    } catch {
      //return [];
    }
    let newProductsResult = newProductsH ? mapEdgesToItems(newProductsH) : [];
    if (newProductsResult && newProductsResult.length > 0) {
      // Randomize the array using sort with a random comparator
      newProductsResult.sort(() => Math.random() - 0.5);
      // Select only the first 12 products
      newProducts = newProductsResult.slice(0, 12);
    }
  }

  /** get banners to be displayed on homepage - content-type = banner */
  let homepageBanners;
  try {
    const homepageBannersResponse = await executeGraphQL<
      PageTypesQuery,
      { filter: any; locale: LanguageCodeEnum }
    >(PageTypesDocument, {
      variables: {
        filter: { pageTypes: [PAGE_TYPE_HP_BANNERS_ID, PAGE_TYPE_HP_CAROUSEL_ID] },
        locale: DEFAULT_LOCALE,
      },
      revalidate: 60 * 5,
    });
    homepageBanners = homepageBannersResponse.pages;
  } catch {
    //return null;
  }
  const allHomepageBanners = homepageBanners ? mapEdgesToItems(homepageBanners) : [];
  const displayHomepageBanners = allHomepageBanners.filter(
    (banner) => banner.pageType.slug === "homepage-banners",
  );
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

  const displayHomepageCarousel = allHomepageBanners.filter(
    (banner) => banner.pageType.slug === "homepage-carousel",
  );
  displayHomepageCarousel.sort((a, b) => {
    const orderA = Number(
      a.attributes.find((attr) => attr.attribute.slug === "order")?.values[0]?.name || 0,
    );
    const orderB = Number(
      b.attributes.find((attr) => attr.attribute.slug === "order")?.values[0]?.name || 0,
    );

    return orderA - orderB;
  });
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
      revalidate: 60 * 60 * 24,
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
      revalidate: 60 * 60 * 24,
    });
    salesProducts = salesProductsH ? mapEdgesToItems(salesProductsH) : [];
    if (salesProducts && salesProducts.length > 0) {
      // Randomize the array using sort with a random comparator
      salesProducts.sort(() => Math.random() - 0.5);
      // Select only the first 12 products
      displayedSalesProducts = salesProducts.slice(0, 12);
    }
  }

  const bannerContainerSize =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Display Banner FullScreen") : "";

  const content = page && "content" in page ? translate(page, "content") : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  const isEmptyContent = emptyTagsRegex.test(parsedContent);

  let videoUrl, videoBannerPath, aspectRatio;
  const displayVideo = page?.metadata.find((m) => m.key === "Display Video");
  if (displayVideo && displayVideo.value === "YES") {
    const videoFile =
      page?.attributes.find((attr) => attr.attribute.name === "Video")?.values?.[0]?.name || "";
    const videoBannerFile =
      page?.attributes.find((attr) => attr.attribute.name === "Banner")?.values?.[0]?.name || "";
    const videoFilePath = videoFile ? `${UPLOAD_FOLDER ?? ""}/${videoFile}` : "#";
    videoBannerPath = videoBannerFile ? `${UPLOAD_FOLDER ?? ""}/${videoBannerFile}` : "#";
    const youtubeUrl = page?.metadata.find((m) => m.key === "Youtube");
    videoUrl = youtubeUrl?.value ? youtubeUrl.value : videoFilePath;
    aspectRatio = page?.metadata.find((m) => m.key === "AspectRatio")?.value;
  }
  const carouselW = page?.metadata.find((m) => m.key === "Carusel Width")?.value || "1900";
  const carouselH = page?.metadata.find((m) => m.key === "Carusel Height")?.value || "550";

  let brandCollections;
  try {
    brandCollections = await executeGraphQL<
      CollectionsByMetaKeyQuery,
      { filter: any; channel: string; locale: string; productFilter: any }
    >(CollectionsByMetaKeyDocument, {
      variables: {
        filter: {
          metadata: [{ key: "isBrand", value: "YES" }],
          published: "PUBLISHED",
        },
        productFilter: {
          stockAvailability: "IN_STOCK",
          isVisibleInListing: true,
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
      <MainBanner
        displayVideo={displayVideo}
        videoUrl={videoUrl}
        videoBannerPath={videoBannerPath}
        aspectRatio={aspectRatio}
        displayHomepageCarousel={displayHomepageCarousel}
        carouselW={carouselW}
        carouselH={carouselH}
        bannerContainerSize={bannerContainerSize}
      />
      <div className="block p-0 max-w-[1920px] mx-auto">
        {displayHomepageBanners && displayHomepageBanners.length > 0 && (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${numColumnsHPBanners} gap-4 my-4`}
          >
            {displayHomepageBanners.map((banner, index) => (
              <HomepageBlock key={banner.id} item={banner} type="homepage" index={index} />
            ))}
          </div>
        )}
      </div>

      {parsedContent && !isEmptyContent && (
        <div className="container my-4 md:my-8 mx-auto max-w-[800px] text-center prose-2xl">
          <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
        </div>
      )}

      {displayedSalesProducts && displayedSalesProducts.length > 0 && (
        <div className="container py-4 md:pt-10 md:pb-24">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8 text-center">
              {messages["app.search.outletTitle"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button
                className="swiper-button-prev-sales custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="prev"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button
                className="swiper-button-next-sales ew custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer"
                aria-label="next"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <SwiperComponent
            isLoop={true}
            products={displayedSalesProducts as Product[]}
            prevButtonClass="swiper-button-prev-sales"
            nextButtonClass="swiper-button-next-sales"
            messages={messages}
          />
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
                <button
                  className="swiper-button-prev-new custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer"
                  aria-label="prev"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
                </button>
                <button
                  className="swiper-button-next-new custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer"
                  aria-label="next"
                >
                  <ChevronRightIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            <SwiperComponent
              isLoop={true}
              products={newProducts as Product[]}
              prevButtonClass="swiper-button-prev-new"
              nextButtonClass="swiper-button-next-new"
              messages={messages}
            />
          </div>
        )}
      <div className="py-12 md:py-20 mb-10 items-center justify-items-center w-full border-t border-dark-300 md:min-h-[90px]">
        <div className="container md:flex flex-col gap-6 md:gap-12 lg:gap-20">
          {brandCollections &&
            (() => {
              const filteredCollections =
                brandCollections.collections?.edges.filter(
                  (edge) => edge.node?.products?.totalCount !== 0,
                ) || [];

              const totalBrands = filteredCollections.length;
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
              for (let i = 0; i < filteredCollections.length; i += numColumns) {
                brandCollectionsRows.push(filteredCollections.slice(i, i + numColumns));
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
                          className="hover:brightness-125 hover:contrast-115 transition-all duration-30 max-w-[160px]"
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

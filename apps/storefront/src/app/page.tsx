import { getMessages, getMetadataValue, getNumColumns, getOrderValue } from "src/lib/util";
import { DEFAULT_LOCALE, defaultRegionQuery } from "src/lib/regions";
import { executeGraphQL } from "@/lib/graphql";
import {
  CategoriesByMetaKeyDocument,
  CategoriesByMetaKeyQuery,
  CategoryFilterInput,
  CollectionBySlugDocument,
  CollectionBySlugQuery,
  CollectionFilterInput,
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  LanguageCodeEnum,
  PageDocument,
  PageQuery,
  Product,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
  ProductOrder,
} from "@/saleor/api";
import { mapEdgesToItems } from "@/lib/maps";
import { Metadata } from "next";
import { STOREFRONT_NAME, UPLOAD_FOLDER } from "@/lib/const";
import { translate } from "@/lib/translations";
import edjsHTML from "editorjs-html";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SwiperComponent from "@/components/SwiperComponent";
import HomepageBlock from "@/components/homepage/HomepageBlock";
import getBase64 from "@/lib/generateBlurPlaceholder";
import Banner from "@/components/homepage/Banner";

const parser = edjsHTML();
const emptyTagsRegex = /^<[^>]+>\s*(<br\s*\/?>)?\s*<\/[^>]+>$/;

export const generateMetadata = async (): Promise<Metadata> => {
  const response = await executeGraphQL<PageQuery, { slug: String; locale: LanguageCodeEnum }>(
    PageDocument,
    {
      variables: { slug: "home", locale: DEFAULT_LOCALE },
      revalidate: 60,
    },
  );
  const page = response.page;

  return {
    title: page && (page.seoTitle || STOREFRONT_NAME),
    description: page && (page.seoDescription || "Premium bike store for Trek, Bontrager, ION"),
  };
};

export default async function Home() {
  const messages = getMessages(DEFAULT_LOCALE);
  //get page by slug home
  const { page } = await executeGraphQL<PageQuery, { slug: String; locale: LanguageCodeEnum }>(
    PageDocument,
    {
      variables: { slug: "home", locale: DEFAULT_LOCALE },
      revalidate: 60,
    },
  );

  const filter: ProductFilterInput = { isPublished: true, stockAvailability: "IN_STOCK" };
  const sortBy: ProductOrder = { direction: "DESC", field: "PUBLICATION_DATE" };
  const queryVariables = {
    filter,
    first: 10,
    ...defaultRegionQuery(),
    sortBy,
  };

  const { products: newProductsH } = await executeGraphQL<ProductCollectionQuery, { filter: any }>(
    ProductCollectionDocument,
    {
      variables: queryVariables,
      revalidate: 60,
    },
  );
  let newProducts = newProductsH ? mapEdgesToItems(newProductsH) : [];

  /** feature-products collection */
  const { collection: featuredCollection } = await executeGraphQL<
    CollectionBySlugQuery,
    { slug: string; channel: string; locale: LanguageCodeEnum }
  >(CollectionBySlugDocument, {
    variables: {
      slug: "highlights",
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  let featuredProducts;
  if (featuredCollection) {
    const { products: featuredProductsH } = await executeGraphQL<
      ProductCollectionQuery,
      { filter: any; sortBy: any; first: number; locale: string; channel: string }
    >(ProductCollectionDocument, {
      variables: {
        filter: {
          isPublished: true,
          stockAvailability: "IN_STOCK",
          collections: [featuredCollection?.id],
        },
        first: 10,
        ...defaultRegionQuery(),
        sortBy,
      },
      revalidate: 60,
    });
    featuredProducts = featuredProductsH ? mapEdgesToItems(featuredProductsH) : [];
  }

  /** categories to be displayed on homepage */
  const categoryFilter: CategoryFilterInput = {
    metadata: [{ key: "Show on Homepage", value: "YES" }],
  };
  const { categories } = await executeGraphQL<
    CategoriesByMetaKeyQuery,
    { filter: CategoryFilterInput; locale: LanguageCodeEnum }
  >(CategoriesByMetaKeyDocument, {
    variables: {
      filter: categoryFilter,
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });
  const homepageCategories = categories ? mapEdgesToItems(categories) : [];
  homepageCategories.sort((a, b) => getOrderValue(a.metadata) - getOrderValue(b.metadata));
  const numColumnsHPCategories = getNumColumns(homepageCategories.length);

  /** collections to be displayed on homepage */
  const collectionFilter: CollectionFilterInput = {
    metadata: [{ key: "Show on Homepage", value: "YES" }],
  };

  const { collections } = await executeGraphQL<
    CollectionsByMetaKeyQuery,
    { filter: CollectionFilterInput; locale: LanguageCodeEnum }
  >(CollectionsByMetaKeyDocument, {
    variables: {
      filter: collectionFilter,
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  const homepageCollections = collections ? mapEdgesToItems(collections) : [];
  homepageCollections.sort((a, b) => getOrderValue(a.metadata) - getOrderValue(b.metadata));
  const numColumnsHPCollections = getNumColumns(homepageCollections.length);
  /** banner1 */
  const banner1Attribute =
    page && "attributes" in page
      ? page.attributes.find((attr) => attr.attribute.name === "Homepage Banner1")
      : null;

  const hasBanner1 = banner1Attribute?.values.length ? banner1Attribute?.values.length > 0 : false;
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
  const displayTextBanner1 =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Banner1 Text Display") : "";
  const banner1TextStyle =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Banner1 Text Style") : "";
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
  let parsedBanner2RichText, displayTextBanner2, banner2TextStyle, placeholder_2;
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
  }
  const shopRichTextAttributes =
    page && "attributes" in page
      ? page.attributes.filter(
          (attr) =>
            attr.attribute.inputType === "RICH_TEXT" &&
            (attr.attribute.name === "Content column1" ||
              attr.attribute.name === "Content column2"),
        )
      : [];

  const content = page && "content" in page ? translate(page, "content") : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  const isEmptyContent = emptyTagsRegex.test(parsedContent);
  const featuredCollectionText =
    (featuredCollection && translate(featuredCollection, "description")) || "";
  const parsedFeaturedCollectionText = featuredCollectionText
    ? parser.parse(JSON.parse(featuredCollectionText))
    : "";
  return (
    <>
      {hasBanner1 && !hasBanner2 && (
        <div className="flex overflow-hidden mb-20 md:mb-28 !px-0">
          <div className="flex flex-col w-full h-[125vw] md:max-h-[80vh]">
            <Banner
              bannerAttribute={banner1Attribute}
              parsedBannerRichText={parsedBanner1RichText}
              displayTextBanner={displayTextBanner1}
              bannerTextStyle={banner1TextStyle}
              placeholder={placeholder}
            />
          </div>
        </div>
      )}

      {hasBanner1 && hasBanner2 && (
        <div className="flex overflow-hidden mb-20 md:mb-28 !px-0">
          <div className="flex flex-col w-full md:w-[98%] mx-auto h-[250vw] md:max-h-[80vh] md:flex-row gap-4 md:gap-6">
            <Banner
              bannerAttribute={banner1Attribute}
              parsedBannerRichText={parsedBanner1RichText}
              displayTextBanner={displayTextBanner1}
              bannerTextStyle={banner1TextStyle}
              placeholder={placeholder}
            />
            <Banner
              bannerAttribute={banner2Attribute}
              parsedBannerRichText={parsedBanner2RichText}
              displayTextBanner={displayTextBanner2}
              bannerTextStyle={banner2TextStyle}
              placeholder={placeholder_2}
            />
          </div>
        </div>
      )}

      {parsedContent && !isEmptyContent && (
        <div className="container mb-4 md:mb-14 mx-auto max-w-[800px] text-center prose-2xl">
          <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
        </div>
      )}

      {featuredCollection && featuredProducts && (
        <div className="container px-8 py-24">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left">
              {translate(featuredCollection, "name") || messages["app.featuredProducts"]}
            </h2>
            <div className="swiper-navigation flex">
              <button className="swiper-button-prev-featured custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="swiper-button-next-featured custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="prose-2xl mb-8">
            <div dangerouslySetInnerHTML={{ __html: parsedFeaturedCollectionText }} />
          </div>
          <div>
            <SwiperComponent
              products={featuredProducts as Product[]}
              prevButtonClass="swiper-button-prev-featured"
              nextButtonClass="swiper-button-next-featured"
              type="featured"
            />
          </div>
        </div>
      )}
      <div className="container block">
        {homepageCollections && homepageCollections.length > 0 && (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${numColumnsHPCollections} gap-4 mt-20 md:mb-40`}
          >
            {homepageCollections.map((collection) => (
              <HomepageBlock key={collection.id} item={collection} type="collection" />
            ))}
          </div>
        )}
        {homepageCategories && homepageCategories.length > 0 && (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${numColumnsHPCategories} gap-4 mt-20 mb-40`}
          >
            {homepageCategories.map((category) => (
              <HomepageBlock key={category.id} item={category} type="category" />
            ))}
          </div>
        )}
      </div>

      {newProducts && (
        <div className="container px-8 pb-24">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
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
          <div style={{ maxHeight: "400px" }}>
            <SwiperComponent
              products={newProducts as Product[]}
              prevButtonClass="swiper-button-prev-new"
              nextButtonClass="swiper-button-next-new"
            />
          </div>
        </div>
      )}

      {shopRichTextAttributes && shopRichTextAttributes.length > 0 && (
        <div className="container flex flex-col md:flex-row  prose-2xl">
          {shopRichTextAttributes.map((attr, index) =>
            attr.values.map((item) => {
              const parsedRichText = item.richText
                ? parser.parse(JSON.parse(item.richText)).join("")
                : "";
              if (parsedRichText) {
                return (
                  <div
                    key={`${index}`}
                    className="md:w-1/2 px-4 md:border-t md:border-gray-300 md:py-20"
                  >
                    <div className="p-2" dangerouslySetInnerHTML={{ __html: parsedRichText }} />
                  </div>
                );
              }
            }),
          )}
        </div>
      )}
    </>
  );
}

import { getMessages } from "src/lib/util";
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
import Link from "next/link";
import Image from "next/image";
import edjsHTML from "editorjs-html";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SwiperComponent from "@/components/SwiperComponent";
import HomepageBlock from "@/components/homepage/HomepageBlock";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import getBase64 from "@/lib/generateBlurPlaceholder";

const parser = edjsHTML();

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

function getMetadataValue(metadataArray: any[], key: any) {
  const item = metadataArray.find((metadata) => metadata.key === key);
  return item ? item.value : null; // Return null if the key is not found
}

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
  if (newProducts) {
    newProducts = groupProductsByColor(newProducts as GroupedProduct[]);
  }

  /** feature-products collection */
  const { collection: featuredCollection } = await executeGraphQL<
    CollectionBySlugQuery,
    { slug: string; channel: string; locale: LanguageCodeEnum }
  >(CollectionBySlugDocument, {
    variables: {
      slug: "featured-products",
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
    if (featuredProducts) {
      featuredProducts = groupProductsByColor(featuredProducts as GroupedProduct[]);
    }
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

  const bannerAttribute =
    page && "attributes" in page
      ? page.attributes.find((attr) => attr.attribute.name === "Banner")
      : null;
  const richTextAttributes =
    page && "attributes" in page
      ? page.attributes.filter((attr) => attr.attribute.inputType === "RICH_TEXT")
      : [];
  const buttonText =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Button Text") : "";
  const linkBanner =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Link Banner") : "#";
  const textBanner =
    page && "metadata" in page ? getMetadataValue(page.metadata, "Text Banner") : "";

  const content = page && "content" in page ? translate(page, "content") : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  const base64 =
    bannerAttribute?.values[0]?.name &&
    (await getBase64(`${UPLOAD_FOLDER ?? ""}/${bannerAttribute.values[0].name}`));
  const placeholder = base64 || null;
  return (
    <>
      {bannerAttribute && (
        <div className="flex overflow-hidden not-last:mb-md !px-0 mb-28">
          <div className="flex flex-col md:flex-row w-full h-[125vw] md:max-h-[80vh]">
            <div className="relative overflow-hidden flex-col-reverse my-0 mx-auto w-full h-full md:flex-row">
              <div className="w-full h-full">
                <Link
                  href={linkBanner || "#"}
                  className="flex no-select transition items-center relative disabled:cursor-not-allowed focus h-full w-full leading-none focus-in"
                >
                  <div className="relative flex h-full w-full overflow-hidden">
                    {bannerAttribute?.values[0]?.name && (
                      <Image
                        key="banner"
                        src={`${UPLOAD_FOLDER ?? ""}/${bannerAttribute.values[0].name}`}
                        alt={buttonText || ""}
                        className="absolute h-full w-full inset-0 object-cover object-center"
                        fill
                        sizes="100vw"
                        priority={true}
                        loading={"eager"}
                        {...(placeholder !== null
                          ? { placeholder: "blur", blurDataURL: placeholder }
                          : {})}
                      />
                    )}
                  </div>
                </Link>
              </div>
              <div className="banner-content absolute left-1/2 transform -translate-x-1/2 bottom-28 bg-black py-10 px-18">
                <h2 className="text-center text-lg text-white">{textBanner}</h2>
                <p className="text-center mt-3 text-md text-white">
                  <a
                    rel="noreferrer"
                    href={linkBanner}
                    target="_self"
                    className="hover:text-action-1"
                  >
                    <u>{buttonText}</u>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container mb-14 mx-auto max-w-[800px] text-center prose-2xl">
        <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
      </div>
      {featuredCollection && featuredProducts && (
        <div className="container px-8 pb-24">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
              {messages["app.featuredProducts"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button className="swiper-button-prev-featured custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="swiper-button-next-featured custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div>
            <SwiperComponent
              products={featuredProducts as Product[]}
              prevButtonClass="swiper-button-prev-featured"
              nextButtonClass="swiper-button-next-featured"
            />
          </div>
        </div>
      )}
      <div className="container block">
        {homepageCollections && homepageCollections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 mb-40">
            {homepageCollections.map((collection) => (
              <HomepageBlock key={collection.id} item={collection} type="collection" />
            ))}
          </div>
        )}
        {homepageCategories && homepageCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20 mb-40">
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

      {richTextAttributes && richTextAttributes.length > 0 && (
        <div className="container flex flex-col md:flex-row  prose-2xl">
          {richTextAttributes.map((attr, index) =>
            attr.values.map((item) => {
              const parsedRichText = item.richText
                ? parser.parse(JSON.parse(item.richText)).join("")
                : "";
              if (parsedRichText) {
                return (
                  <div key={`${index}`} className="md:w-1/2 p-4 border-t border-gray-300 py-20">
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

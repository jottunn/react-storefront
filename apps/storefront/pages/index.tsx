import { ApolloQueryResult } from "@apollo/client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import React, { ReactElement } from "react";
import Image from "next/image";
import { HomepageBlock, Layout, RichText } from "@/components";
import { BaseSeo } from "@/components/seo/BaseSeo";
import { contextToRegionQuery } from "@/lib/regions";
import {
  CategoriesByMetaKeyDocument,
  CategoriesByMetaKeyQuery,
  CategoriesByMetaKeyQueryVariables,
  CategoryFilterInput,
  CollectionFilterInput,
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  CollectionsByMetaKeyQueryVariables,
  PageDocument,
  PageQuery,
  PageQueryVariables,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCollectionQueryVariables,
  ProductFilterInput,
  ProductOrder,
} from "@/saleor/api";
import { serverApolloClient } from "@/lib/ssr/common";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ProductCard } from "@/components/ProductCollection/ProductCard";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { mapEdgesToItems } from "@/lib/maps";
import { useIntl } from "react-intl";
import { messages } from "@/components/translations";
import { UPLOAD_FOLDER } from "@/lib/const";
import { translate } from "@/lib/translations";
import "swiper/css";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  try {
    const response: ApolloQueryResult<PageQuery> = await serverApolloClient.query<
      PageQuery,
      PageQueryVariables
    >({
      query: PageDocument,
      variables: {
        slug: "home",
        locale: contextToRegionQuery(context).locale,
      },
      fetchPolicy: "no-cache",
    });
    /**New products */
    const filter: ProductFilterInput = { isPublished: true, stockAvailability: "IN_STOCK" };
    const sortBy: ProductOrder = { direction: "DESC", field: "PUBLICATION_DATE" };

    const queryVariables = {
      filter,
      first: 8,
      ...contextToRegionQuery(context),
      sortBy,
    };

    const productsResponse: ApolloQueryResult<ProductCollectionQuery> =
      await serverApolloClient.query<ProductCollectionQuery, ProductCollectionQueryVariables>({
        query: ProductCollectionDocument,
        variables: queryVariables,
        fetchPolicy: "no-cache",
      });

    let newProducts = mapEdgesToItems(productsResponse.data.products);
    newProducts = groupProductsByColor(newProducts as GroupedProduct[]);

    /** Categories */
    const categoryFilter: CategoryFilterInput = {
      metadata: [{ key: "Show on Homepage", value: "YES" }],
    };

    const categoriesResponse: ApolloQueryResult<CategoriesByMetaKeyQuery> =
      await serverApolloClient.query<CategoriesByMetaKeyQuery, CategoriesByMetaKeyQueryVariables>({
        query: CategoriesByMetaKeyDocument,
        variables: {
          filter: categoryFilter,
          ...contextToRegionQuery(context),
        },
        fetchPolicy: "no-cache",
      });

    const homepageCategories = mapEdgesToItems(categoriesResponse.data.categories);

    /** Collections */
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "Show on Homepage", value: "YES" }],
    };

    const collectionsResponse: ApolloQueryResult<CollectionsByMetaKeyQuery> =
      await serverApolloClient.query<CollectionsByMetaKeyQuery, CollectionsByMetaKeyQueryVariables>(
        {
          query: CollectionsByMetaKeyDocument,
          variables: {
            filter: collectionFilter,
            ...contextToRegionQuery(context),
          },
          fetchPolicy: "no-cache",
        },
      );

    const homepageCollections = mapEdgesToItems(collectionsResponse.data.collections);

    return {
      props: {
        page: response?.data.page,
        newProducts: newProducts,
        homepageCategories: homepageCategories,
        homepageCollections: homepageCollections,
      },
      //revalidate: 6, // value in seconds, how often ISR will trigger on the server
    };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return {
      props: {
        page: {}, // Provide default props or empty objects
        newProducts: [],
        homepageCategories: [],
        homepageCollections: [],
      },
      //revalidate: 1,
    };
  }
};

function getMetadataValue(metadataArray: any[], key: any) {
  const item = metadataArray.find((metadata) => metadata.key === key);
  return item ? item.value : null; // Return null if the key is not found
}

function Home({
  page,
  newProducts,
  homepageCategories,
  homepageCollections,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
  const t = useIntl();
  const content = page && "content" in page && translate(page, "content");

  return (
    <>
      <BaseSeo />
      <div className="flex overflow-hidden not-last:mb-md !px-0 mb-28">
        <div className="flex flex-col md:flex-row w-full h-[125vw] md:max-h-[80vh]">
          <div className="relative overflow-hidden flex-col-reverse my-0 mx-auto w-full h-full md:flex-row">
            <div className="w-full h-full">
              <a
                className="flex no-select transition items-center relative disabled:cursor-not-allowed focus h-full w-full leading-none focus-in"
                rel=""
                href={linkBanner}
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
                    />
                  )}
                </div>
              </a>
            </div>
            <div className="banner-content absolute left-1/2 transform -translate-x-1/2 bottom-28 bg-white p-10">
              <h2 className="text-center text-lg">{textBanner}</h2>
              <p className="text-center mt-3 text-md">
                <a rel="noreferrer" href={linkBanner} target="_self" className="">
                  <u>{buttonText}</u>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {content && (
        <div className="container mb-6 mx-auto max-w-[800px] text-center">
          <RichText jsonStringData={content} />
        </div>
      )}

      {newProducts && newProducts.length > 0 && (
        <div className="container px-8 pb-24">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
              {t.formatMessage(messages.newProducts)}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button className="swiper-button-prev1 custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="swiper-button-next1 custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div style={{ maxHeight: "400px" }}>
            <Swiper
              slidesPerView={2}
              spaceBetween={10}
              modules={[Navigation]}
              navigation={{
                prevEl: ".swiper-button-prev1",
                nextEl: ".swiper-button-next1",
              }}
              breakpoints={{
                // When the viewport width is >= 640px
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                // When the viewport width is >= 768px
                768: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                // When the viewport width is >= 1024px
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 40,
                },
              }}
            >
              {newProducts.map((product, index) => (
                <SwiperSlide key={index}>
                  <ProductCard
                    key={product.id}
                    product={product as GroupedProduct}
                    priority={false}
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      <div className="container block">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 mb-40">
          {homepageCollections &&
            homepageCollections.map((collection) => (
              <HomepageBlock key={collection.id} item={collection} type="collection" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20 mb-40">
          {homepageCategories &&
            homepageCategories.map((category) => (
              <HomepageBlock key={category.id} item={category} type="category" />
            ))}
        </div>
      </div>

      {richTextAttributes && richTextAttributes.length > 0 && (
        <div className="container flex flex-col md:flex-row">
          {richTextAttributes.map((attr, index) =>
            attr.values.map((item) => {
              const parsedRichText = JSON.parse(item.richText as "string");
              if (parsedRichText && parsedRichText.blocks && parsedRichText.blocks.length > 0) {
                return (
                  <div key={`${index}`} className="md:w-1/2 p-4 border-t border-gray-300 py-20">
                    <div className="p-2">
                      <RichText jsonStringData={item.richText || undefined} />
                    </div>
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

export default Home;

// export const getStaticPaths: GetStaticPaths = () => ({
//   paths: [],
//   fallback: "blocking",
// });

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

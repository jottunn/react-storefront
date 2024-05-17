import { ApolloQueryResult, useQuery } from "@apollo/client";
import clsx from "clsx";
import { GetServerSidePropsContext, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement, useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import { parseCookies } from "nookies";
import { Layout, RichText, VariantSelector } from "@/components";
import { ProductGallery } from "@/components/product/ProductGallery";
import { useRegions } from "@/components/RegionsProvider";
import { ProductPageSeo } from "@/components/seo/ProductPageSeo";
import { messages } from "@/components/translations";
import { usePaths } from "@/lib/paths";
import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { DEFAULT_CHANNEL, contextToRegionQuery, localeToEnum } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CheckoutError,
  PageByIdDocument,
  PageByIdQuery,
  PageFragment,
  ProductBySlugDocument,
  ProductBySlugQuery,
  ProductBySlugQueryVariables,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCollectionQueryVariables,
  useCheckoutAddProductLineMutation,
  useCreateCheckoutMutation,
} from "@/saleor/api";
import { serverApolloClient } from "@/lib/ssr/common";
import { useUser } from "@/lib/useUser";
import { mapEdgesToItems } from "@/lib/maps";
import getBase64 from "@/lib/generateBlurPlaceholder";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { ProductCard } from "@/components/ProductCollection/ProductCard";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { ChevronLeftIcon, ChevronRightIcon, TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import {
  ATTR_BRAND_REF,
  ATTR_COLOR_COMMERCIAL_SLUG,
  ATTR_GHID_MARIMI,
  UPLOAD_FOLDER,
} from "@/lib/const";

export type OptionalQuery = {
  variant?: string;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ locale: string; slug: string }>,
) => {
  if (!context.params) {
    return {
      props: {},
      notFound: true,
    };
  }

  const productSlug = context.params.slug.toString();
  const { variant } = context.query;

  // Read the channel from cookies
  const cookies = parseCookies(context);
  const currentChannel = cookies.currentChannel || DEFAULT_CHANNEL.slug;

  const response: ApolloQueryResult<ProductBySlugQuery> = await serverApolloClient.query<
    ProductBySlugQuery,
    ProductBySlugQueryVariables
  >({
    query: ProductBySlugDocument,
    variables: {
      slug: productSlug,
      channel: currentChannel,
      locale: contextToRegionQuery(context).locale,
    },
  });

  const selectedVariantId = Array.isArray(variant) ? variant[0] : variant;
  let placeholder: string | null = null;
  const thumb = response.data.product?.thumbnail?.url;
  if (thumb) {
    try {
      const base64 = await getBase64(thumb);
      placeholder = base64 || null;
    } catch (error) {
      console.error("Error fetching base64 for thumbnail:", error);
    }
  }
  const categoryId = response.data.product?.category?.id ?? "";

  const relatedProductsResponse: ApolloQueryResult<ProductCollectionQuery> =
    await serverApolloClient.query<ProductCollectionQuery, ProductCollectionQueryVariables>({
      query: ProductCollectionDocument,
      variables: {
        filter: {
          categories: [categoryId].filter(Boolean),
          stockAvailability: "IN_STOCK",
        },
        first: 10,
        ...contextToRegionQuery(context),
      },
    });

  let relatedProducts = mapEdgesToItems(relatedProductsResponse.data.products).filter(
    (relatedProduct) => relatedProduct.slug !== response.data?.product?.slug,
  );
  relatedProducts = groupProductsByColor(relatedProducts as GroupedProduct[]);

  const getRefPage = async (attrSlug: string | null | undefined): Promise<PageFragment> => {
    const attribute = response.data.product?.attributes.find(
      (attr) => attr.attribute.slug === attrSlug,
    );
    if (!attribute || attribute.values.length === 0) return {} as PageFragment;
    const pageId = attribute.values[0].reference;
    const pageTabelMarimiResponse: ApolloQueryResult<PageByIdQuery> =
      await serverApolloClient.query<PageByIdQuery>({
        query: PageByIdDocument,
        variables: {
          id: pageId,
          locale: contextToRegionQuery(context).locale,
        },
      });

    return pageTabelMarimiResponse.data.page || ({} as PageFragment);
  };
  const attrSizeGuideSlug = ATTR_GHID_MARIMI;
  const attrBrandSlug = ATTR_BRAND_REF;
  const sizeGuide = await getRefPage(attrSizeGuideSlug);
  const brandRefPage = await getRefPage(attrBrandSlug);

  return {
    props: {
      product: response.data.product,
      selectedVariantId: selectedVariantId || null,
      placeholder: placeholder,
      relatedProducts: relatedProducts,
      sizeGuide: sizeGuide,
      brandRefPage: brandRefPage,
    },
  };
  // If you want to redirect the user
  // return {
  //   redirect: {
  //     destination: '/some-destination',
  //     permanent: false,
  //   },
  // };

  // If the page is not found
  // return {
  //   notFound: true,
  // };
};

function ProductPage({
  product: initialProduct,
  selectedVariantId: initialSelectedVariantId,
  placeholder,
  relatedProducts,
  sizeGuide,
  brandRefPage,
}: InferGetStaticPropsType<typeof getServerSideProps>) {
  // console.log('render ProductPage');

  const router = useRouter();
  const paths = usePaths();
  const t = useIntl();
  const { user } = useUser();
  const { currentChannel, query, currentLocale, formatPrice } = useRegions();
  const [localChannel, setLocalChannel] = useState(currentChannel.slug);
  const { checkoutToken, setCheckoutToken, checkout, setCartModalOpen } = useCheckout();
  const [createCheckout] = useCreateCheckoutMutation();
  const [addProductToCheckout] = useCheckoutAddProductLineMutation();
  const [loadingAddToCheckout, setLoadingAddToCheckout] = useState(false);
  const [addToCartError, setAddToCartError] = useState("");
  const productSlug = router.query.slug;
  const skipQuery = useRef(true);
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariantId, setSelectedVariantId] = useState(initialSelectedVariantId);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const { refetch } = useQuery<ProductBySlugQuery>(ProductBySlugDocument, {
    variables: {
      slug: productSlug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    },
    skip: skipQuery.current,
  });

  useEffect(() => {
    //show blurry pics?
    refetch({
      slug: productSlug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    })
      .then((response) => {
        // Handle the successful refetch here
        if (response.data.product) {
          setProduct(response.data.product);
          const newVariant = response.data.product.variants?.find(
            (v) => v.id === router.query.variant,
          );
          if (newVariant) {
            setSelectedVariantId(newVariant?.id);
          }
        }
      })
      .catch((error) => {
        console.error("Error during refetch:", error);
        // Handle the error here
      });
  }, [productSlug]);

  useEffect(() => {
    //if (currentChannel.slug !== localChannel) {
    //TODO add a check + if product not available in current channel, add a redirect to default
    refetch({
      slug: productSlug,
      locale: localeToEnum(currentLocale),
      channel: currentChannel.slug,
    })
      .then((response) => {
        // Handle the successful refetch here
        if (response.data.product) {
          setProduct(response.data.product);
        }
      })
      .catch((error) => {
        console.error("Error during refetch:", error);
        // Handle the error here
      });
    setLocalChannel(currentChannel.slug);
    // Ensure future updates don't skip the query
    skipQuery.current = false;
    // }
  }, [currentChannel.slug, localChannel, currentLocale]);

  useEffect(() => {
    //used to reload info when different variant is selected from product page
    if (router.query.variant) {
      const variantFromURL = router.query.variant;
      const newSelectedVariantID = Array.isArray(variantFromURL)
        ? variantFromURL[0]
        : variantFromURL;
      if (newSelectedVariantID !== selectedVariantId) {
        //const selectedVariant = product?.variants?.find((v) => v?.id === newSelectedVariantID) || undefined;
        setSelectedVariantId(newSelectedVariantID);
      }
    }
  }, [router.query.variant]);

  if (!product?.id) {
    return <Custom404 />;
  }

  const onAddToCart = async () => {
    // Clear previous error messages
    setAddToCartError("");
    // Block add to checkout button
    setLoadingAddToCheckout(true);
    const errors: CheckoutError[] = [];

    if (!selectedVariant) {
      return;
    }

    if (checkout) {
      // If checkout is already existing, add products
      const { data: addToCartData } = await addProductToCheckout({
        variables: {
          checkoutToken,
          variantId: selectedVariant.id,
          locale: query.locale,
        },
      });
      addToCartData?.checkoutLinesAdd?.errors.forEach((e) => {
        if (e) {
          errors.push(e);
        }
      });
    } else {
      // Theres no checkout, we have to create one
      const { data: createCheckoutData } = await createCheckout({
        variables: {
          email: user?.email,
          channel: currentChannel.slug,
          lines: [
            {
              quantity: 1,
              variantId: selectedVariant.id,
            },
          ],
        },
      });
      createCheckoutData?.checkoutCreate?.errors.forEach((e) => {
        if (e) {
          errors.push(e);
        }
      });
      if (createCheckoutData?.checkoutCreate?.checkout?.token) {
        setCheckoutToken(createCheckoutData?.checkoutCreate?.checkout?.token);
      }
    }
    // Enable button
    setLoadingAddToCheckout(false);

    if (errors.length === 0) {
      // Product successfully added
      setCartModalOpen(true);
      return;
    }

    // Display error message
    const errorMessages = errors.map((e) => e.message || "") || [];
    setAddToCartError(errorMessages.join("\n"));
  };

  const selectedVariant =
    product.variants && product.variants.length > 1
      ? product?.variants?.find((v) => v?.id === selectedVariantId)
      : product.variants?.[0];

  const isAddToCartButtonDisabled =
    !product.isAvailableForPurchase ||
    (product.variants && product.variants.length > 1 && !selectedVariantId) ||
    selectedVariant?.quantityAvailable === 0 ||
    loadingAddToCheckout;
  const description = translate(product, "description");
  const categoryAncestors = mapEdgesToItems(product.category?.ancestors);
  const brandAttribute = product.attributes.find((attr) => attr.attribute.slug === "brand");
  const commercialColorAttr = selectedVariant?.attributes.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
  );

  return (
    <>
      <ProductPageSeo product={product} />
      <main>
        <div
          className={clsx(
            "grid grid-cols-1 gap-[2rem] md:gap-[3rem] max-h-full container px-8 md:grid-cols-2 pb-4",
          )}
        >
          <div className="h-full relative">
            {product.variants?.[0]?.pricing?.onSale && (
              <TagIcon className="text-action-1 w-6 h-6 absolute right-4 top-4" />
            )}
            <ProductGallery
              placeholder={placeholder}
              product={product}
              selectedVariant={selectedVariant}
            />
          </div>
          <div className="space-y-5 m-auto mt-6 md:mt-40 md:mb-20 md:max-w-2xl">
            <div className="flex items-center justify-center space-x-2">
              {categoryAncestors.map((parent) => (
                <React.Fragment key={parent.slug}>
                  <Link href={paths.categories._slug(parent.slug).$url()} passHref legacyBehavior>
                    <a className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600">
                      {translate(parent, "name")}
                    </a>
                  </Link>
                  <span className="text-gray-600 text-md mt-2">/</span>
                </React.Fragment>
              ))}

              {!!product.category?.slug && (
                <>
                  <Link
                    href={paths.categories._slug(product?.category?.slug).$url()}
                    passHref
                    legacyBehavior
                  >
                    <a className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600">
                      {translate(product.category, "name")}
                    </a>
                  </Link>
                </>
              )}
            </div>
            <h1
              className="text-4xl font-bold tracking-tight text-gray-800 text-center"
              data-testid="productName"
            >
              {translate(product, "name")}{" "}
              {commercialColorAttr?.values[0]?.name
                ? " - " + commercialColorAttr?.values[0]?.name
                : ""}
            </h1>

            <Link
              href={paths.brands._slug(brandAttribute?.values[0]?.slug || "").$url()}
              passHref
              legacyBehavior
            >
              <a className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block">
                {brandRefPage &&
                  Object.keys(brandRefPage).length > 0 &&
                  brandRefPage?.attributes?.map((attr) => (
                    <Image
                      key={attr.attribute.name}
                      src={`${UPLOAD_FOLDER ?? ""}/${attr?.values?.[0]?.name ?? ""}`}
                      alt={brandRefPage.title}
                      width={80}
                      height={80}
                      style={{
                        objectFit: "contain",
                        maxWidth: "100px",
                        display: "inline-block",
                        width: "auto",
                        height: "auto",
                      }}
                      priority={false}
                      loading="lazy"
                    />
                  ))}

                {(!brandRefPage || (brandRefPage && Object.keys(brandRefPage).length === 0)) &&
                  brandAttribute?.values[0]?.name}
              </a>
            </Link>

            {product.variants?.length === 1 && (
              <h2 className="text-xl font-bold tracking-tight text-gray-800 text-center">
                <span>{formatPrice(product.variants?.[0]?.pricing?.price?.gross)}</span>
                {product.variants?.[0]?.pricing?.onSale && (
                  <span className="text-lg ml-2 opacity-75">
                    <s>{formatPrice(product.variants?.[0]?.pricing.priceUndiscounted?.gross)}</s>
                  </span>
                )}
              </h2>
            )}

            {product.variants && product.variants?.length > 1 && (
              <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                sizeGuide={sizeGuide}
                setShowSizeGuideModal={setShowSizeGuideModal}
              />
            )}

            <div className="w-full">
              <button
                onClick={onAddToCart}
                type="submit"
                disabled={isAddToCartButtonDisabled}
                className={clsx(
                  "w-full py-3 px-8 flex items-center justify-center text-base bg-action-1 text-white disabled:bg-disabled hover:bg-action-2 hover:text-white border-2 border-transparent  focus:outline-none uppercase",
                  !isAddToCartButtonDisabled && "hover:border-action-1 hover:text-white",
                )}
                data-testid="addToCartButton"
              >
                {loadingAddToCheckout
                  ? t.formatMessage(messages.adding)
                  : t.formatMessage(messages.addToCart)}
              </button>

              {!selectedVariant && isAddToCartButtonDisabled && (
                <p className="text-base text-yellow-600">
                  {t.formatMessage(messages.variantNotChosen)}
                </p>
              )}

              {selectedVariant?.quantityAvailable === 0 && (
                <p className="text-base text-yellow-600" data-testid="soldOut">
                  {t.formatMessage(messages.soldOut)}
                </p>
              )}

              {!!addToCartError && <p className="text-red-500 font-bold">{addToCartError}</p>}
            </div>
          </div>
        </div>
        <div className="container pb-12">
          {description && (
            <div className="space-y-6">
              <p className="text-md mt-8 font-bold text-black-500 uppercase">
                {t.formatMessage(messages.description)}
              </p>
              <RichText jsonStringData={description} />
            </div>
          )}
        </div>
        <hr />

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="container px-8 pt-44 pb-44">
            <div className="swiper-header flex justify-center items-center space-x-4">
              <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
                {t.formatMessage(messages.relatedProducts)}
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
                    slidesPerView: 4,
                    spaceBetween: 40,
                  },
                }}
              >
                {relatedProducts.map((product, index) => (
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
        {showSizeGuideModal && sizeGuide && Object.keys(sizeGuide).length > 0 && (
          <div className="min-h-screen absolute overflow-hidden grid grid-cols-1 mx-auto px-8 md:h-full w-full text-center bg-gray-800/80 top-0 z-50">
            <button
              type="button"
              className="absolute grid content-center justify-center right-0 p-8 h-10 w-10 z-50 mt-10"
              aria-label="Close"
              onClick={() => setShowSizeGuideModal(false)}
            >
              <XMarkIcon className="w-10 h-10 border text-white hover:text-red" />
            </button>
            <div className="container m-auto">
              <RichText jsonStringData={sizeGuide.content || ""} />
              {sizeGuide.attributes.map((attr) => (
                <Image
                  key={attr?.attribute.name}
                  src={`${UPLOAD_FOLDER ?? ""}/${attr?.values?.[0]?.name ?? ""}`}
                  alt={sizeGuide.title}
                  fill={true}
                  style={{ objectFit: "contain", padding: "4rem 0" }}
                  priority={false}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default ProductPage;

ProductPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

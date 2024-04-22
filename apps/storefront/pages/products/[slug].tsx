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
import { AttributeDetails } from "@/components/product/AttributeDetails";
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
import { serverApolloClient } from "@/lib/auth/useAuthenticatedApolloClient";
import { useUser } from "@/lib/useUser";
import { mapEdgesToItems } from "@/lib/maps";
import getBase64 from "@/lib/generateBlurPlaceholder";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { ProductCard } from "@/components/ProductCollection/ProductCard";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { XIcon } from "@heroicons/react/outline";
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
  context: GetServerSidePropsContext<{ locale: string; slug: string }>
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

  // const variants = response.data.product?.variants;
  // if (variants) {
  //   if (!selectedVariantID && variants.length === 1) {
  //     selectedVariant = variants[0];
  //   } else {
  //     selectedVariant = variants.find(v => v.id === selectedVariantID);
  //   }
  // }
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
    (relatedProduct) => relatedProduct.slug !== response.data?.product?.slug
  );
  relatedProducts = groupProductsByColor(relatedProducts as GroupedProduct[]);

  const getRefPage = async (attrSlug: string | null | undefined): Promise<PageFragment> => {
    const attribute = response.data.product?.attributes.find(
      (attr) => attr.attribute.slug === attrSlug
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
            (v) => v.id === router.query.variant
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
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG
  );

  return (
    <>
      <ProductPageSeo product={product} />
      <main>
        <div
          className={clsx(
            "grid grid-cols-1 gap-[3rem] max-h-full overflow-auto md:overflow-hidden container px-8 md:grid-cols-2 pb-4"
          )}
        >
          <div>
            <ProductGallery
              placeholder={placeholder}
              product={product}
              selectedVariant={selectedVariant}
            />
          </div>
          <div className="space-y-5 m-auto mt-10 md:mt-40 md:mb-20 md:max-w-2xl">
            <div className="flex items-center justify-center space-x-2">
              {categoryAncestors.map((parent) => (
                <React.Fragment key={parent.slug}>
                  <Link href={paths.category._slug(parent.slug).$url()} passHref legacyBehavior>
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
                    href={paths.category._slug(product?.category?.slug).$url()}
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
                      style={{ objectFit: "contain", maxWidth: "100px", display: "inline-block" }}
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
              <VariantSelector product={product} selectedVariant={selectedVariant} />
            )}
            {sizeGuide && Object.keys(sizeGuide).length > 0 && (
              <div className="text-right w-full">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSizeGuideModal(true);
                  }}
                  className="text-sm hover:text-action-1 font-bold text-right py-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 32 32"
                    className="inline-flex relative shrink justify-center items-center transition w-xl h-xl touch:group-active:[&amp;>*]:fill-ghost [&amp;>*]:fill-ink [&amp;>*]:hover:fill-ink-hover"
                  >
                    <path
                      fill="#000"
                      fillRule="evenodd"
                      d="M8.865 9.01a.993.993 0 0 0-.854.856c-.015.1-.015 4.16 0 4.27.052.397.35.732.739.833.13.033-.184.03 4.125.033l3.98.002-1.399 1.4c-1.382 1.382-1.4 1.4-1.422 1.448a.42.42 0 0 0-.03.09c-.005.029-.006.712-.005 2.434.003 2.59 0 2.414.034 2.543.064.247.229.468.451.604.102.063.202.1.352.132.044.01.416.01 4.103.012 2.745.002 4.08 0 4.136-.004a1.005 1.005 0 0 0 .917-.864c.013-.101.013-4.162 0-4.263a.999.999 0 0 0-.892-.863 57.398 57.398 0 0 0-1.348-.007h-1.28l1.401-1.401c1.334-1.333 1.403-1.403 1.426-1.448a.366.366 0 0 0 .03-.082c.01-.049.009-4.744 0-4.833a.999.999 0 0 0-.863-.892c-.098-.013-13.506-.013-13.6 0Zm.08.663a.314.314 0 0 0-.186.102.292.292 0 0 0-.074.121l-.015.042-.002 2.035c-.001 1.423 0 2.049.005 2.08a.34.34 0 0 0 .255.271c.023.005.2.008.552.008h.518V9.665h-.51c-.281.001-.526.004-.544.007Zm1.725 2.326v2.332h12l-.002-2.193c-.001-2.12-.002-2.195-.013-2.229a.325.325 0 0 0-.088-.142.325.325 0 0 0-.182-.095c-.03-.004-.22-.006-.547-.005l-.503.002-.003.874-.003.873-.015.037a.342.342 0 0 1-.364.21.341.341 0 0 1-.277-.262 27.247 27.247 0 0 1-.006-.885v-.85H18.67l-.002.865-.001.866-.015.04c-.02.057-.05.1-.096.143a.301.301 0 0 1-.155.08.337.337 0 0 1-.386-.221l-.014-.042-.002-.866-.001-.865H16v.853c0 .94.002.895-.04.973a.357.357 0 0 1-.146.141.337.337 0 0 1-.462-.183l-.014-.034-.004-.873-.003-.874h-1.996l-.004.874-.003.873-.015.037a.342.342 0 0 1-.364.21.341.341 0 0 1-.277-.262 27.247 27.247 0 0 1-.006-.885v-.85H10.67v2.333Zm5.801 4.336-1.33 1.33H19.53l1.33-1.33 1.332-1.332h-4.39l-1.332 1.332Zm-1.801 4.187c0 2.414-.003 2.223.04 2.303a.36.36 0 0 0 .205.163c.028.008.68.009 4.089.009 4.027 0 4.055 0 4.096-.013a.342.342 0 0 0 .229-.262c.009-.058.009-4.051 0-4.109a.33.33 0 0 0-.094-.179.32.32 0 0 0-.143-.087c-.031-.01-.07-.012-.395-.014l-.36-.002-.001.866-.002.866-.015.041a.335.335 0 0 1-.477.19.352.352 0 0 1-.17-.23 22.701 22.701 0 0 1-.007-.886v-.847h-.974c-.536 0-.985.002-.999.005l-.024.004v.848c0 .735-.001.855-.01.89a.336.336 0 0 1-.47.223.375.375 0 0 1-.158-.162l-.024-.05-.003-.877-.003-.877H17.003l-.003.873c-.003.819-.004.876-.015.902a.362.362 0 0 1-.208.207.41.41 0 0 1-.222-.001.346.346 0 0 1-.214-.242c-.005-.024-.007-.291-.007-.888v-.855H14.67v2.191Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {t.formatMessage(messages.sizeGuide)}
                </a>
              </div>
            )}
            <div className="w-full">
              <button
                onClick={onAddToCart}
                type="submit"
                disabled={isAddToCartButtonDisabled}
                className={clsx(
                  "w-full py-3 px-8 flex items-center justify-center text-base bg-action-1 text-white disabled:bg-disabled hover:bg-action-2 hover:text-white border-2 border-transparent  focus:outline-none uppercase",
                  !isAddToCartButtonDisabled && "hover:border-action-1 hover:text-white"
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
            <AttributeDetails product={product} selectedVariant={selectedVariant} />

            {description && (
              <div className="space-y-6">
                <p className="text-md mt-8 font-bold text-black-500 uppercase">
                  {t.formatMessage(messages.description)}
                </p>
                <RichText jsonStringData={description} />
              </div>
            )}
          </div>
        </div>
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="container px-8 py-48">
            <h2 className="m-0 text-left text-lg font-bold mb-10">
              {t.formatMessage(messages.relatedProducts)}
            </h2>
            <div style={{ maxHeight: "400px" }}>
              <Swiper
                slidesPerView={1}
                spaceBetween={10}
                modules={[Navigation]}
                navigation
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
              <XIcon className="w-10 h-10 border text-white hover:text-red" />
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

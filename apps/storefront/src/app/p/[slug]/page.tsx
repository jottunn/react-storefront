import { Metadata, ResolvingMetadata } from "next";
import React, { Suspense, use } from "react";
import { defaultRegionQuery } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CheckoutAddProductLineDocument,
  CollectionBySlugDocument,
  CollectionBySlugQuery,
  LanguageCodeEnum,
  PageByIdDocument,
  PageFragment,
  ProductBySlugDocument,
  ProductBySlugQuery,
  ProductCollectionDocument,
  ProductCollectionQuery,
} from "@/saleor/api";
import Image from "next/image";
import { executeGraphQL } from "@/lib/graphql";
import { notFound } from "next/navigation";
import edjsHTML from "editorjs-html";
import * as Checkout from "@/lib/checkout";
import invariant from "ts-invariant";
import { formatMoney } from "@/lib/utils/formatMoney";
import { formatMoneyRange } from "@/lib/utils/formatMoneyRange";
import { type WithContext, type Product } from "schema-dts";
import { AddButton } from "./AddButton";
import xss from "xss";
import { ProductGallery } from "./media/ProductGallery";
import getBase64 from "@/lib/generateBlurPlaceholder";
import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon, TagIcon } from "@heroicons/react/24/outline";
import { mapEdgesToItems } from "@/lib/maps";
import { ATTR_COLOR_COMMERCIAL_SLUG, ATTR_GHID_MARIMI } from "@/lib/const";
import Link from "next/link";
import VariantSelector from "./variants/VariantSelector";
import { getMessages } from "@/lib/util";
import Spinner from "@/components/Spinner";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import SwiperComponent from "@/components/SwiperComponent";
const parser = edjsHTML();

export async function generateMetadata(
  {
    params,
    searchParams,
  }: {
    params: { slug: string; channel: string };
    searchParams: { variant?: string };
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { product } = await executeGraphQL<
    ProductBySlugQuery,
    { slug: string; channel: string; locale: string }
  >(ProductBySlugDocument, {
    variables: {
      slug: decodeURIComponent(params.slug),
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  if (!product) {
    notFound();
  }

  const productName = product.seoTitle || product.name;
  const variantName = product.variants?.find(({ id }) => id === searchParams.variant)?.name;
  const productNameAndVariant = variantName ? `${productName} - ${variantName}` : productName;

  return {
    title: `${product.name} | ${product.seoTitle || (await parent).title?.absolute}`,
    description: product.seoDescription || productNameAndVariant,
    alternates: {
      canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
        ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/p/${encodeURIComponent(params.slug)}`
        : undefined,
    },
    openGraph: product.thumbnail
      ? {
          images: [
            {
              url: product.thumbnail.url,
              alt: product.name,
            },
          ],
        }
      : null,
  };
}

// export async function generateStaticParams() {
//   const { products } = await executeGraphQL<
//     ProductListQuery,
//     { first: number; channel: string; locale: string }
//   >(ProductListDocument, {
//     revalidate: 60,
//     variables: { first: 30, ...defaultRegionQuery() },
//     withAuth: false,
//   });

//   const paths = products?.edges.map(({ node: { slug } }) => ({ slug })) || [];
//   return paths;
// }

const Page = ({
  params,
  searchParams,
}: {
  params: { slug: string; channel: string };
  searchParams: { variant?: string };
}) => {
  const productDetailPromise = ProductDetail({ params, searchParams });

  return <Suspense fallback={<Spinner />}>{use(productDetailPromise)}</Suspense>;
};

const ProductDetail = async ({
  params,
  searchParams,
}: {
  params: { slug: string; channel: string };
  searchParams: { variant?: string };
}) => {
  const { product } = await executeGraphQL<
    ProductBySlugQuery,
    { slug: string; channel: string; locale: string }
  >(ProductBySlugDocument, {
    variables: {
      slug: decodeURIComponent(params.slug),
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  if (!product) {
    notFound();
  }

  console.log(product);
  const messages = getMessages(defaultRegionQuery().locale);
  const firstImage = product.thumbnail;
  const base64 = firstImage && (await getBase64(firstImage.url));
  const placeholder = base64 || null;
  const variants = product.variants;
  const selectedVariantID = searchParams.variant;
  const selectedVariant =
    product.variants && product.variants.length > 1
      ? product?.variants?.find((v: { id: string | undefined }) => v?.id === selectedVariantID)
      : product.variants?.[0];

  const isAddToCartButtonDisabled =
    !product.isAvailableForPurchase ||
    (product.variants && product.variants.length > 1 && !selectedVariantID) ||
    selectedVariant?.quantityAvailable === 0;
  const descriptionT = translate(product, "description");
  const description = descriptionT ? parser.parse(JSON.parse(descriptionT)) : null;
  const categoryAncestors = mapEdgesToItems(product.category?.ancestors);
  const brandAttribute = product.attributes.find((attr) => attr.attribute.slug === "brand");
  const brandCollection =
    brandAttribute &&
    (await executeGraphQL<CollectionBySlugQuery, { slug: string; locale: LanguageCodeEnum }>(
      CollectionBySlugDocument,
      {
        variables: { slug: brandAttribute?.values[0]?.slug || "", ...defaultRegionQuery() },
        revalidate: 60,
      },
    ));
  const commercialColorAttr = selectedVariant?.attributes.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
  );
  const attribute = product.attributes.find((attr) => attr.attribute.slug === ATTR_GHID_MARIMI);
  const pageId = attribute?.values?.[0]?.reference;
  const sizeGuide =
    pageId &&
    (await executeGraphQL<PageFragment, { id: string; locale: LanguageCodeEnum }>(
      PageByIdDocument,
      {
        variables: { id: pageId, ...defaultRegionQuery() },
        revalidate: 60,
      },
    ));

  /**related products */
  const categoryId = product?.category?.id ?? "";
  const { products: relatedProductsResponse } = await executeGraphQL<
    ProductCollectionQuery,
    { filter: any; first: number; channel: string; locale: string }
  >(ProductCollectionDocument, {
    variables: {
      filter: {
        categories: [categoryId].filter(Boolean),
        stockAvailability: "IN_STOCK",
      },
      first: 10,
      ...defaultRegionQuery(),
    },
    revalidate: 60,
  });

  let relatedProducts = mapEdgesToItems(relatedProductsResponse).filter(
    (relatedProduct) => relatedProduct.slug !== product?.slug,
  );
  relatedProducts = groupProductsByColor(relatedProducts as GroupedProduct[]);
  /** recommended products */
  //console.log(product.attributes);
  const recommendedAttribute = product.attributes.find(
    (attr) => attr.attribute.slug === "recommended",
  );
  const recommendedProductIds = recommendedAttribute?.values.map((attr) => attr.reference);
  let recommendedProducts: string | any[] = [];
  if (recommendedProductIds && recommendedProductIds.length > 0) {
    const { products: recommendedProductsResponse } = await executeGraphQL<
      ProductCollectionQuery,
      { filter: any; channel: string; locale: string }
    >(ProductCollectionDocument, {
      variables: {
        filter: {
          ids: recommendedProductIds.filter(Boolean),
          stockAvailability: "IN_STOCK",
        },
        ...defaultRegionQuery(),
      },
      revalidate: 60,
    });

    recommendedProducts = mapEdgesToItems(recommendedProductsResponse);
    recommendedProducts = groupProductsByColor(recommendedProducts as GroupedProduct[]);
  }
  async function addItem() {
    "use server";

    const checkout = await Checkout.findOrCreate({
      checkoutId: Checkout.getIdFromCookies(defaultRegionQuery().channel),
      channel: defaultRegionQuery().channel,
    });
    // console.log('checkout', checkout);
    invariant(checkout, "This should never happen");

    Checkout.saveIdToCookie(defaultRegionQuery().channel, checkout.id);

    if (!selectedVariantID) {
      return;
    }
    await executeGraphQL(CheckoutAddProductLineDocument, {
      variables: {
        id: checkout.id,
        productVariantId: decodeURIComponent(selectedVariantID),
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });
  }

  const isAvailable = variants?.some((variant) => variant.quantityAvailable) ?? false;
  const price = selectedVariant?.pricing?.price?.gross
    ? formatMoney(selectedVariant.pricing.price.gross)
    : isAvailable
      ? formatMoneyRange({
          start: product?.pricing?.priceRange?.start?.gross,
          stop: product?.pricing?.priceRange?.stop?.gross,
        })
      : "";
  const productJsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    image: product.thumbnail?.url,
    ...(selectedVariant
      ? {
          name: `${product.name} - ${selectedVariant.name}`,
          description: product.seoDescription || `${product.name} - ${selectedVariant.name}`,
          offers: {
            "@type": "Offer",
            availability: selectedVariant.quantityAvailable
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            priceCurrency: selectedVariant.pricing?.price?.gross.currency,
            price: selectedVariant.pricing?.price?.gross.amount,
          },
        }
      : {
          name: product.name,

          description: product.seoDescription || product.name,
          offers: {
            "@type": "AggregateOffer",
            availability: product.variants?.some((variant) => variant.quantityAvailable)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            priceCurrency: product.pricing?.priceRange?.start?.gross.currency,
            lowPrice: product.pricing?.priceRange?.start?.gross.amount,
            highPrice: product.pricing?.priceRange?.stop?.gross.amount,
          },
        }),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="container text-left pt-4 pb-8 px-8 space-x-2">
        <Link
          href="/"
          className="text-xs md:text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
        >
          Home
        </Link>{" "}
        <span className="text-gray-600 md:mt-2 text-base">/</span>
        {categoryAncestors.map((parent) => (
          <React.Fragment key={parent.slug}>
            <Link
              href={`/c/${parent.slug}`}
              className="text-xs md:text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
            >
              {translate(parent, "name")}
            </Link>
            <span className="text-gray-600 text-md md:mt-2">/</span>
          </React.Fragment>
        ))}
        {!!product.category?.slug && (
          <>
            <Link
              href={`/c/${product.category.slug}`}
              className="text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
            >
              {translate(product.category, "name")}
            </Link>
          </>
        )}
      </div>
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
        <div className="space-y-5 m-auto mt-6 md:mt-40 md:mb-20 w-full">
          <h1
            className="text-4xl font-bold tracking-tight text-main text-center px-10 leading-[3rem]"
            data-testid="productName"
          >
            {translate(product, "name")}{" "}
            {commercialColorAttr?.values[0]?.name
              ? " - " + commercialColorAttr?.values[0]?.name
              : ""}
          </h1>

          {brandAttribute && (
            <Link
              href={`/collections/${brandAttribute?.values[0]?.slug}`}
              className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block"
            >
              {brandCollection &&
              brandCollection.collection &&
              brandCollection.collection.backgroundImage ? (
                <Image
                  src={brandCollection.collection.backgroundImage?.url}
                  alt={brandCollection.collection.name}
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
              ) : (
                brandAttribute?.values[0]?.name
              )}
            </Link>
          )}

          {product.variants?.length === 0 && (
            <h2 className="text-xl font-bold tracking-tight text-gray-800 text-center">
              <span>{price}</span>
              {product.variants?.[0]?.pricing?.onSale && (
                <span className="text-lg ml-2 opacity-75">
                  {product.variants[0].pricing.priceUndiscounted && (
                    <s>{formatMoney(product.variants[0].pricing.priceUndiscounted.gross)}</s>
                  )}
                </span>
              )}
            </h2>
          )}

          {variants && isAvailable && (
            <VariantSelector
              selectedVariant={selectedVariant}
              product={product}
              messages={messages}
              price={price}
              sizeGuide={sizeGuide}
            />
          )}
          {!isAvailable && (
            <p className="text-md text-center font-semibold text-red-500 uppercase">
              {messages["app.product.soldOut"]}
            </p>
          )}

          {isAvailable && (
            <div className="mt-8 block">
              <form action={addItem} className="m-auto text-center">
                <AddButton disabled={isAddToCartButtonDisabled} messages={messages} />
              </form>
            </div>
          )}
        </div>
      </div>
      <div className="container pb-12 px-8">
        {description && (
          <div className="mt-8 space-y-6 text-base">
            <p className="text-md mt-8 font-bold text-black-500 uppercase">
              {messages["app.product.description"]}
            </p>
            {description.map((content) => (
              <div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
            ))}
          </div>
        )}
      </div>
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="container px-8 pt-44 pb-44 border-t">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
              {messages["app.relatedProducts"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button className="swiper-button-prev-rel custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="swiper-button-next-rel custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div style={{ maxHeight: "400px" }}>
            <SwiperComponent
              products={relatedProducts as any}
              prevButtonClass="swiper-button-prev-rel"
              nextButtonClass="swiper-button-next-rel"
            />
          </div>
        </div>
      )}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className="container px-8 pt-44 pb-44 border-t">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
              {messages["app.recommendedProducts"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button className="swiper-button-prev-rec custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button className="swiper-button-next-rec custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div style={{ maxHeight: "400px" }}>
            <SwiperComponent
              products={recommendedProducts as any}
              prevButtonClass="swiper-button-prev-rec"
              nextButtonClass="swiper-button-next-rec"
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;

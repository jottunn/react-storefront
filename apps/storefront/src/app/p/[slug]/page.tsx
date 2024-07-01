import { Metadata, ResolvingMetadata } from "next";
import React, { Suspense, use } from "react";
import { defaultRegionQuery } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CheckoutAddProductLineDocument,
  CheckoutAddProductLineMutation,
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
import xss from "xss";
import * as Checkout from "@/lib/checkout";
import invariant from "ts-invariant";
import { formatMoney } from "@/lib/utils/formatMoney";
import { formatMoneyRange } from "@/lib/utils/formatMoneyRange";
import { type WithContext, type Product } from "schema-dts";
import { AddButton } from "./AddButton";
import { ProductGallery } from "./media/ProductGallery";
import getBase64 from "@/lib/generateBlurPlaceholder";
import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon, TagIcon } from "@heroicons/react/24/outline";
import { mapEdgesToItems } from "@/lib/maps";
import { ATTR_GHID_MARIMI } from "@/lib/const";
import Link from "next/link";
import VariantSelector from "./variants/VariantSelector";
import { getMessages } from "@/lib/util";
import Spinner from "@/components/Spinner";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import SwiperComponent from "@/components/SwiperComponent";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
const edjsParser = edjsHTML();

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

  const messages = getMessages(defaultRegionQuery().locale);
  const variants = product.variants;
  const selectedVariantID = searchParams.variant;
  const selectedVariant =
    product.variants && product.variants.length > 1
      ? product?.variants?.find((v: { id: string | undefined }) => v?.id === selectedVariantID)
      : product.variants?.[0];

  const firstImage = product.thumbnail;
  const placeholder =
    selectedVariant && selectedVariant.media && selectedVariant.media.length > 0
      ? await getBase64(selectedVariant.media[0].url)
      : firstImage
        ? await getBase64(firstImage.url)
        : null;

  const isAddToCartButtonDisabled =
    !product.isAvailableForPurchase ||
    (product.variants && product.variants.length > 1 && !selectedVariantID) ||
    selectedVariant?.quantityAvailable === 0;

  const descriptionT = translate(product, "description");
  const description = descriptionT ? edjsParser.parse(JSON.parse(descriptionT)) : null;

  const categoryAncestors = mapEdgesToItems(product.category?.ancestors);
  const brandAttribute = product.attributes.find((attr) => attr.attribute.slug === "brand");
  const brandCollection =
    brandAttribute &&
    (await executeGraphQL<CollectionBySlugQuery, { slug: string; locale: LanguageCodeEnum }>(
      CollectionBySlugDocument,
      {
        variables: { slug: brandAttribute?.values[0]?.slug || "", ...defaultRegionQuery() },
        revalidate: 60 * 60 * 24,
      },
    ));

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
    const checkoutId = await Checkout.getIdFromCookies(defaultRegionQuery().channel);
    const checkout = await Checkout.findOrCreate({
      checkoutId: checkoutId,
      channel: defaultRegionQuery().channel,
    });
    console.log("checkout", checkout);
    invariant(checkout, "This should never happen");

    Checkout.saveIdToCookie(defaultRegionQuery().channel, checkout.id);

    if (!selectedVariantID) {
      return;
    }
    const addProducts = await executeGraphQL<
      CheckoutAddProductLineMutation,
      { id: string; locale: LanguageCodeEnum; productVariantId: string }
    >(CheckoutAddProductLineDocument, {
      variables: {
        id: checkout.id,
        productVariantId: decodeURIComponent(selectedVariantID),
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });
    console.log(addProducts.checkoutLinesAdd?.errors);
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

  const breadcrumbItems = [{ name: "Home", href: "/" }];
  categoryAncestors.forEach((parent) => {
    breadcrumbItems.push({
      name: parent.name,
      href: `/c/${parent.slug}`,
    });
  });
  !!product.category?.slug &&
    breadcrumbItems.push({
      name: product.category.name,
      href: `/c/${product.category.slug}`,
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}${item.href}` : undefined,
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <Script
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <div className="container text-left pt-2 pb-2 md:pb-8 space-x-2 pl-0">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div
        className={clsx(
          "grid grid-cols-1 gap-[2rem] md:grid-cols-3 md:gap-[4rem] lg:gap-[10rem] max-h-full container px-8 pb-4",
        )}
      >
        <div className="h-full relative md:col-span-2 md:flex md:items-center md:justify-center">
          {product.variants?.[0]?.pricing?.onSale && (
            <TagIcon className="text-action-1 w-6 h-6 absolute right-4 top-4 z-30" />
          )}
          <ProductGallery
            placeholder={placeholder}
            product={product}
            selectedVariant={selectedVariant}
          />
        </div>
        <div className="space-y-2 md:mt-2 mb-2 md:mt-12 md:mb-4 w-full">
          {brandAttribute && (
            <Link
              href={`/collections/${brandAttribute?.values[0]?.slug}`}
              className="text-md md:mt-2 font-medium text-gray-600 cursor-pointer text-left hover:text-green-600 block"
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
          <h1
            className="text-4xl leading-[3rem] md:text-[3rem] md:leading-[3.5rem] font-bold text-main text-left !mb-4 md:!mb-10"
            data-testid="productName"
          >
            {translate(product, "name")}
          </h1>

          {product.variants?.length === 0 && (
            <p className="text-lg md:text-xl font-bold tracking-tight text-gray-800 text-center">
              <span>{price}</span>
              {product.variants?.[0]?.pricing?.onSale && (
                <span className="text-md ml-2 opacity-75">
                  {product.variants[0].pricing.priceUndiscounted && (
                    <s>{formatMoney(product.variants[0].pricing.priceUndiscounted.gross)}</s>
                  )}
                </span>
              )}
            </p>
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
            <p className="text-md text-left font-semibold text-red-500 uppercase">
              {messages["app.product.soldOut"]}
            </p>
          )}

          {isAvailable && (
            <div className="mt-8 block">
              <form action={addItem} className="m-auto text-left">
                <AddButton disabled={isAddToCartButtonDisabled} messages={messages} />
              </form>
            </div>
          )}
        </div>
      </div>
      <div className="container pb-12 px-8">
        {description && (
          <div className="mt-8 space-y-6">
            <p className="text-md mt-8 font-bold text-black-500 uppercase">
              {messages["app.product.description"]}
            </p>
            {description.map((content, i) => (
              <div
                className="prose prose-2xl prose-list:list-disc w-full max-w-full"
                key={i}
                dangerouslySetInnerHTML={{ __html: xss(content) }}
              />
            ))}
          </div>
        )}
      </div>
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="container px-8 py-12 md:py-44 border-t">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
              {messages["app.relatedProducts"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button
                className="swiper-button-prev-rel custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="Prev"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button
                className="swiper-button-next-rel custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer"
                aria-label="Next"
              >
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
              <button
                className="swiper-button-prev-rec custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="Prev"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button
                className="swiper-button-next-rec custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer"
                aria-label="Next"
              >
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

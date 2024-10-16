import { Metadata, ResolvingMetadata } from "next";
import React, { Suspense, use } from "react";
import { defaultRegionQuery } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CollectionBySlugDocument,
  CollectionBySlugQuery,
  LanguageCodeEnum,
  PageByIdDocument,
  PageFragment,
  ProductBySlugDocument,
  ProductBySlugQuery,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
  ProductListDocument,
  ProductListQuery,
} from "@/saleor/api";
import Image from "next/image";
import { executeGraphQL } from "@/lib/graphql";
import { notFound } from "next/navigation";
import edjsHTML from "editorjs-html";
import xss from "xss";
import { formatMoney } from "@/lib/utils/formatMoney";
import { formatMoneyRange } from "@/lib/utils/formatMoneyRange";
import { type WithContext, type Product } from "schema-dts";
import { AddButton } from "./AddButton";
import { ProductGallery } from "./media/ProductGallery";
import getBase64 from "@/lib/generateBlurPlaceholder";
import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon, TagIcon } from "@heroicons/react/24/outline";
import { mapEdgesToItems } from "@/lib/maps";
import { ATTR_GHID_MARIMI, STOREFRONT_URL } from "@/lib/const";
import Link from "next/link";
import VariantSelector from "./variants/VariantSelector";
import { getMessages, getMetadataValue } from "@/lib/util";
import Spinner from "@/components/Spinner";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import SwiperComponent from "@/components/SwiperComponent";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
import RelatedProducts from "./RelatedProducts";
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
): Promise<Metadata | []> {
  let product;
  try {
    const response = await executeGraphQL<
      ProductBySlugQuery,
      { slug: string; channel: string; locale: string }
    >(ProductBySlugDocument, {
      variables: {
        slug: decodeURIComponent(params.slug),
        ...defaultRegionQuery(),
      },
      revalidate: 60,
    });
    product = response.product;
  } catch {
    return [];
  }

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
      canonical: STOREFRONT_URL
        ? STOREFRONT_URL + `/p/${encodeURIComponent(params.slug)}`
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
//   let featuredCollection;
//   try {
//     const response = await executeGraphQL<
//       CollectionBySlugQuery,
//       { slug: string; channel: string; locale: LanguageCodeEnum }
//     >(CollectionBySlugDocument, {
//       variables: {
//         slug: "highlights",
//         ...defaultRegionQuery(),
//       },
//     });
//     featuredCollection = response.collection;
//   } catch {
//     return [];
//   }
//   const filter: ProductFilterInput = {
//     isPublished: true,
//     stockAvailability: "IN_STOCK",
//   };
//   if (featuredCollection) {
//     filter.collections = [featuredCollection.id];
//   }
//   const { products } = await executeGraphQL<
//     ProductListQuery,
//     { first: number; channel: string; locale: string; filter: ProductFilterInput }
//   >(ProductListDocument, {
//     revalidate: 60,
//     variables: {
//       first: 30, ...defaultRegionQuery(), filter
//     },
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

  return (
    <Suspense
      fallback={
        <div className="h-[75vh] justify-center flex flex-col items-center">
          <Spinner />
        </div>
      }
    >
      {use(productDetailPromise)}
    </Suspense>
  );
};

const ProductDetail = async ({
  params,
  searchParams,
}: {
  params: { slug: string; channel: string };
  searchParams: { variant?: string };
}) => {
  let product;
  try {
    const response = await executeGraphQL<
      ProductBySlugQuery,
      { slug: string; channel: string; locale: string }
    >(ProductBySlugDocument, {
      variables: {
        slug: decodeURIComponent(params.slug),
        ...defaultRegionQuery(),
      },
      revalidate: 60,
    });
    product = response.product;
  } catch {
    return [];
  }

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
  const hasPlaceholderMeta =
    selectedVariant && getMetadataValue(selectedVariant?.metadata, "blurPlaceholderPic");
  const placeholder = hasPlaceholderMeta
    ? hasPlaceholderMeta
    : selectedVariant && selectedVariant.media && selectedVariant.media.length > 0
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
  const brandSlug = brandAttribute?.values[0]?.slug || "";
  let brandCollection;
  try {
    brandCollection =
      brandAttribute &&
      brandSlug &&
      (await executeGraphQL<CollectionBySlugQuery, { slug: string; locale: LanguageCodeEnum }>(
        CollectionBySlugDocument,
        {
          variables: { slug: brandSlug, ...defaultRegionQuery() },
          revalidate: 60 * 60 * 24,
        },
      ));
  } catch {
    return [];
  }

  const attributeSizeGuide = product.attributes.find(
    (attr) => attr.attribute.slug === ATTR_GHID_MARIMI,
  );
  const pageId = attributeSizeGuide?.values?.[0]?.reference;

  let sizeGuide;
  try {
    sizeGuide =
      pageId &&
      (await executeGraphQL<PageFragment, { id: string; locale: LanguageCodeEnum }>(
        PageByIdDocument,
        {
          variables: { id: pageId, ...defaultRegionQuery() },
          revalidate: 60,
        },
      ));
  } catch {
    return [];
  }

  /** recommended products */
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
      revalidate: 60 * 60,
    });

    recommendedProducts = mapEdgesToItems(recommendedProductsResponse);
    recommendedProducts = groupProductsByColor(recommendedProducts as GroupedProduct[]);
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
      item: item.href ? `${STOREFRONT_URL}${item.href}` : undefined,
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
        <div className="h-full relative md:col-span-2 md:flex md:items-center md:justify-center md:gap-4">
          {product.variants?.[0]?.pricing?.onSale && (
            <TagIcon className="text-action-1 w-8 h-8 md:w-12 md:h-12 absolute right-4 top-4 z-30" />
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
              className="text-md my-4 md:mb-6 font-medium text-gray-600 cursor-pointer text-left hover:text-green-600 inlin-block w-auto"
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

          {variants && (
            <VariantSelector
              selectedVariant={selectedVariant}
              product={product}
              messages={messages}
              price={price}
              sizeGuide={sizeGuide}
            />
          )}
          {!isAvailable && (
            <p className="text-base text-left font-semibold text-red-500 uppercase">
              {messages["app.product.soldOut"]}
            </p>
          )}

          {isAvailable && (
            <div className="mt-8 block">
              <AddButton
                disabled={isAddToCartButtonDisabled}
                messages={messages}
                selectedVariantId={selectedVariantID}
              />
              {selectedVariant?.quantityAvailable === 0 && (
                <p className="text-base text-left font-semibold text-red-500 pt-2">
                  {messages["app.product.soldOutVariant"]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="container pb-12 px-8">
        {description && (
          <div className="mt-8 space-y-2 md:max-w-[80%]">
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

      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className="container px-8 py-12 md:py-40 border-t">
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

      <Suspense
        fallback={
          <div>
            <Spinner />
          </div>
        }
      >
        <RelatedProducts
          product={product}
          messages={messages}
          recommendedProducts={recommendedProducts}
        />
      </Suspense>
    </main>
  );
};

export default Page;

import { getCurrentUser } from "src/app/actions";
import LoginForm from "src/app/login/LoginForm";
import { getMessages } from "@/lib/util";
import { DEFAULT_CHANNEL, DEFAULT_LOCALE } from "@/lib/regions";
import { HeartIcon } from "@heroicons/react/24/solid";
import { ProductVariantsDocument, ProductVariantsQuery } from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
const messages = getMessages(DEFAULT_LOCALE);
export const dynamic = "force-dynamic";
import Image from "next/image";
import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";
import { TagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatMoney } from "@/lib/utils/formatMoney";
import { AddToWishlist } from "src/app/p/[slug]/AddToWishlist";
import { AddButton } from "src/app/p/[slug]/AddButton";

const WishlistPage = async () => {
  const user = await getCurrentUser();
  if (!user || user === null) {
    return (
      <div className="w-[85%] md:w-[35%]">
        <LoginForm messages={messages} />
      </div>
    );
  }
  const userWishlist = user?.metadata.find((meta) => meta.key === "wishlist");
  const currentWishlist = userWishlist ? JSON.parse(userWishlist.value) : [];
  let variants: any[] = [];
  if (currentWishlist.length > 0) {
    try {
      const response = await executeGraphQL<
        ProductVariantsQuery,
        { ids: string[]; channel: string }
      >(ProductVariantsDocument, {
        variables: { ids: currentWishlist, channel: DEFAULT_CHANNEL.slug },
        cache: "no-cache",
      });
      const prodVariants = response.productVariants;
      variants = prodVariants ? mapEdgesToItems(prodVariants) : [];
    } catch {
      return [];
    }
  }

  return (
    <div className="container">
      <div className="mx-6 mt-6 md:mx-0 md:my-0 md:flex md:flex-wrap md:gap-2">
        <h2 className="checkout-section-header-active mb-6">
          {messages["app.preferences.navigation.wishlist"]}
        </h2>
        <HeartIcon className="mt-1 w-6 h-6 inline text-action-1" />
      </div>
      <div className="space-y-6">
        {variants.length === 0 ? (
          <p className="block mt-2 font-extrabold text-main hover:text-gray-700 text-base md:text-md">
            {messages["app.product.noWishlist"]}
          </p>
        ) : (
          variants.map((variant: any, index) => {
            let thumbnailUrl;
            if (variant && variant.media && variant.media.length > 0) {
              //sort media by sortOrder
              const sortedMedia = variant.media
                .filter((item: { type: string }) => item.type !== "VIDEO")
                .sort((a: { sortOrder: number }, b: { sortOrder: number }) => {
                  if (typeof a.sortOrder === "number" && typeof b.sortOrder === "number") {
                    return a.sortOrder - b.sortOrder;
                  }
                  return 30;
                });

              if (sortedMedia && sortedMedia.length > 0) {
                thumbnailUrl = sortedMedia[0].url;
              }
            }
            const variantAttr = variant?.attributes.find(
              (attr: { attribute: { slug: string } }) =>
                attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
            );
            const colorName = variantAttr?.values[0]?.name || ""; // Fallback to an empty string if color is undefined
            // Construct the string, ensuring that undefined values are handled.
            const productDisplayName = `${variant.product.name}${colorName ? ` - ${colorName}` : ""}`;
            const brandAttribute = variant.product.attributes.find(
              (attribute: { attribute: { slug: string } }) => attribute.attribute.slug === "brand",
            );
            const mainValue = brandAttribute?.values[0];

            return (
              <div
                key={variant.id}
                className="grid grid-cols-2 md:grid-cols-wishlist gap-6 items-center pb-8 border-b-1 border-black-100"
                data-testid="wishlistProductsList"
              >
                <Link href={`/p/${variant.product.slug}?variant=${variant?.id}`} prefetch={false}>
                  <div className="bg-white w-full aspect-1">
                    <div className="border w-full h-full relative content-center">
                      {thumbnailUrl && (
                        <Image
                          alt={variant.product.name}
                          className="transition-opacity duration-400 ease-in-out p-3 max-h-[100%]"
                          src={thumbnailUrl}
                          width={200}
                          height={200}
                          sizes="(max-width: 640px) 50vw, 33vw"
                          priority={true}
                          loading={"eager"}
                          style={{
                            objectFit: "contain",
                            opacity: 1,
                          }}
                        />
                      )}
                      {variant.pricing?.onSale && (
                        <div className="absolute right-2 top-2 py-1 px-2">
                          <TagIcon className="text-action-1 w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                <div>
                  <p className="block mt-2 font-extrabold text-main hover:text-gray-700 text-base md:text-md md:min-h-[50px]">
                    {productDisplayName}
                  </p>
                  <p className="block text-sm font-normal text-main pt-2 pb-2">{mainValue?.name}</p>
                  <p className="block text-sm font-normal text-main pt-2 pb-2">
                    Size: {variant.name}
                  </p>
                  <p className="block text-main font-normal mb-6">
                    <span className="text-md">
                      {variant &&
                        variant.pricing?.price?.gross &&
                        formatMoney(variant.pricing?.price?.gross)}
                    </span>
                    {variant &&
                      variant.pricing?.onSale &&
                      variant.pricing.priceUndiscounted?.gross && (
                        <span className="text-sm ml-2 opacity-75">
                          <s>{formatMoney(variant.pricing.priceUndiscounted?.gross)}</s>
                        </span>
                      )}
                  </p>
                </div>
                <div>
                  <AddToWishlist
                    selectedVariantId={variant.id}
                    messages={messages}
                    refresh={true}
                  />
                </div>
                <div className="justify-center">
                  <AddButton
                    disabled={
                      variant?.quantityAvailable === 0 || variant.product.isAvailable === false
                    }
                    messages={messages}
                    selectedVariantId={variant?.id}
                  />
                  {(variant?.quantityAvailable === 0 || variant.product.isAvailable === false) && (
                    <p className="text-base text-left font-semibold text-red-500 pt-2">
                      {messages["app.product.soldOutVariant"]}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

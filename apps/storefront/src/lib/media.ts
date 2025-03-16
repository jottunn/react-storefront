"use client";
import {
  ProductDetailsFragment,
  ProductMediaType,
  ProductVariantDetailsFragment,
  ProductVariant,
} from "@/saleor/api";

export function notNullable<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

interface ProductMedia {
  __typename?: "ProductMedia";
  alt: string;
  type: ProductMediaType;
  url: string;
  sortOrder?: number | null;
  // Include any other properties that ProductMedia has
}

export interface EnhancedProductMedia extends ProductMedia {
  thumbnailUrl?: string | null;
}

/**
 * Sorts media items by sortOrder
 */
export function sortMedia(media: ProductMedia[]) {
  return [...media].sort((a, b) => {
    if (typeof a.sortOrder === "number" && typeof b.sortOrder === "number") {
      return a.sortOrder - b.sortOrder;
    }
    return 30;
  });
}

/**
 * Finds appropriate media for a product variant
 * @param product - The product
 * @param variant - The selected variant
 * @param options - Configuration options
 * @returns Array of media items
 */
export function findVariantMedia(
  product: ProductDetailsFragment,
  variant?: any,
  options: {
    filterVideos?: boolean;
    enhanceVideos?: boolean;
    limit?: number;
  } = {},
): EnhancedProductMedia[] {
  const { filterVideos = false, enhanceVideos = false, limit } = options;

  let sourceMedia: ProductMedia[] = [];

  // 1. Check if the variant has media
  if (variant && variant.media && variant.media.length > 0) {
    sourceMedia = variant.media;
  }
  // 2. If variant has no media, look for other variants with the same color
  else if (variant && product.variants) {
    const selectedColor = variant.attributes.find((attr: any) => attr.attribute.slug === "culoare")
      ?.values[0]?.id;

    if (selectedColor) {
      // Find other variants with the same color that have media
      const variantsWithSameColor = product.variants.filter((v) => {
        const variantColor = v.attributes.find((attr: any) => attr.attribute.slug === "culoare")
          ?.values[0]?.id;

        return variantColor === selectedColor && v.media && v.media.length > 0;
      });

      // Use media from the first variant with the same color that has media
      if (variantsWithSameColor.length > 0) {
        sourceMedia = variantsWithSameColor[0].media || [];
      }
    }
  }

  // 3. Fall back to product media if no variant media found
  // if (sourceMedia.length === 0 && product.media) {
  //   sourceMedia = product.media;
  // }

  // Filter out null/undefined items
  let filteredMedia = sourceMedia.filter(notNullable);

  // Filter videos if needed
  if (filterVideos) {
    filteredMedia = filteredMedia.filter((item) => item.type !== "VIDEO");
  }

  // Sort media
  filteredMedia = sortMedia(filteredMedia);

  // Limit the number of items if specified
  if (typeof limit === "number") {
    filteredMedia = filteredMedia.slice(0, limit);
  }

  // Enhance videos with thumbnails if needed
  if (enhanceVideos) {
    return filteredMedia.map((mediaItem): EnhancedProductMedia => {
      if (mediaItem.type === "VIDEO") {
        const thumbnailUrl = getVideoThumbnail(mediaItem.url);
        return { ...mediaItem, thumbnailUrl };
      }
      return mediaItem;
    });
  }

  return filteredMedia;
}

/**
 * Helper function for ProductCard component
 * Returns the first two images for thumbnail and hover
 */
export function getProductCardMedia(product: ProductDetailsFragment, variant?: any) {
  const media = findVariantMedia(product, variant, {
    filterVideos: true,
    limit: 2,
  });

  return {
    thumbnailUrl: media[0]?.url || "",
    hoverImageUrl: media[1]?.url || media[0]?.url || "",
    alt: media[0]?.alt || product.name || "",
  };
}

/**
 * Helper function for VariantColorSelector
 * Returns just the first image for each color
 */
export function getColorSelectorMedia(product: ProductDetailsFragment, variant?: any) {
  const media = findVariantMedia(product, variant, {
    filterVideos: true,
    limit: 1,
  });

  return {
    url: media[0]?.url || "",
    alt: media[0]?.alt || product.name || "",
  };
}

/**
 * If a variant has been selected by the user and this variant has media, return only those items.
 * Otherwise, all product media are returned.
 * @param product  The product object
 * @param selectedVariant   The selected variant object
 */
export const getGalleryMedia = ({
  product,
  selectedVariant,
}: {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
}): EnhancedProductMedia[] => {
  return findVariantMedia(product, selectedVariant, {
    enhanceVideos: true,
  });
};

export const getYouTubeIDFromURL = (url: string) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : undefined;
};

export const getVideoThumbnail = (videoUrl: string) => {
  const videoId = getYouTubeIDFromURL(videoUrl);
  if (!videoId) {
    return null;
  }
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

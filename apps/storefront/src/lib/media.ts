"use client";
import {
  ProductDetailsFragment,
  ProductMediaType,
  ProductVariantDetailsFragment,
} from "@/saleor/api";

export function notNullable<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
/**
 * If a variant has been selected by the user and this variant has media, return only those items.
 * Otherwise, all product media are returned.
 * @param product  The product object
 * @param selectedVariant   The selected variant object
 */

interface ProductMedia {
  __typename?: "ProductMedia";
  alt: string;
  type: ProductMediaType;
  url: string;
  // Include any other properties that ProductMedia has
}

export interface EnhancedProductMedia extends ProductMedia {
  thumbnailUrl?: string | null;
}

export const getGalleryMedia = ({
  product,
  selectedVariant,
}: {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
}): EnhancedProductMedia[] => {
  // Determine the source of the media items
  const sourceMedia =
    selectedVariant && selectedVariant.media?.length !== 0 ? selectedVariant.media : product.media;

  // Ensure the media is not null or undefined before filtering
  const filteredMedia = sourceMedia?.filter(notNullable) || [];
  //make sure the media is correctly sorted
  filteredMedia
    .filter((item) => item.type !== "VIDEO")
    .sort((a, b) => {
      if (typeof a.sortOrder === "number" && typeof b.sortOrder === "number") {
        return a.sortOrder - b.sortOrder;
      }
      return 30;
    });

  // Enhance media items with thumbnail URLs for videos
  const enhancedMediaItems = filteredMedia.map((mediaItem): EnhancedProductMedia => {
    if (mediaItem.type === "VIDEO") {
      const thumbnailUrl = getVideoThumbnail(mediaItem.url);
      // Include the thumbnail URL in the media item object
      return { ...mediaItem, thumbnailUrl };
    }
    // Return unmodified media items if not a video
    return mediaItem;
  });

  return enhancedMediaItems;
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

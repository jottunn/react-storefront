"use client";
import { generateSrcset, getStrapiMedia } from "@/lib/strapi/api-helpers";
import Image from "next/image";
import { useState } from "react";
import MediaModal from "src/app/p/[slug]/media/MediaModal";

interface Image {
  id: number;
  attributes: {
    alternativeText: string | null;
    caption: string | null;
    url: string;
    formats: any;
    width: number;
    height: number;
  };
}

interface SlidShowProps {
  mediaGallery: {
    data: Image[];
  };
}

export default function MediaGallery({ data }: { data: SlidShowProps }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setCurrentIndex(null);
  };
  let mediaGalleryMap: { url: string | null; alt: string }[] = [];
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-12">
        {data.mediaGallery &&
          data.mediaGallery.data.map((fadeImage: Image, index) => {
            const imageUrl = getStrapiMedia(fadeImage.attributes.url);
            const smallImage = fadeImage?.attributes?.formats && fadeImage.attributes.formats.small;
            const imageUrlSmall = smallImage && smallImage.url && getStrapiMedia(smallImage.url);

            mediaGalleryMap.push({
              url: imageUrl,
              alt: fadeImage?.attributes?.alternativeText || "",
            });
            return (
              <div
                key={index}
                onClick={() => handleImageClick(index)}
                className="cursor-pointer m-auto hover:brightness-125 hover:contrast-115 transition-all duration-30"
              >
                <img
                  src={imageUrlSmall || imageUrl}
                  className="w-full h-96 object-cover rounded-lg"
                  height={smallImage ? smallImage.height : fadeImage.attributes.height}
                  width={smallImage ? smallImage.width : fadeImage.attributes.width}
                  alt={fadeImage?.attributes?.alternativeText || ""}
                />
              </div>
            );
          })}
      </div>
      {currentIndex !== null && (
        <div className="fixed bg-black bg-opacity-95 md:bg-opacity-70 overlow-hidden min-h-screen min-w-screen h-full w-full top-0 bottom-0 left-0 right-0 z-50">
          <MediaModal
            currentIndex={currentIndex}
            galleryMedia={mediaGalleryMap as any}
            closeModal={closeModal}
          />
        </div>
      )}
    </>
  );
}

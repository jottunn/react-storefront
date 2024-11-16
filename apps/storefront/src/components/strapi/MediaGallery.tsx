"use client";
import { getStrapiMedia } from "@/lib/strapi/api-helpers";
import Image from "next/image";
import { useState } from "react";
import MediaModal from "src/app/p/[slug]/media/MediaModal";

const getNumColumns = (length: number) => {
  let numColumns = 3;
  if (length < 3) {
    numColumns = 2;
  } else if (length % 4 === 0) {
    numColumns = 4;
  }
  return numColumns;
};

export default function MediaGallery({ data }: { data: any }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setCurrentIndex(null);
  };
  let mediaGalleryMap: { url: string | null; alt: string }[] = [];
  const mediaGallery = data.mediaGallery?.data; //strapi5  const mediaGallery = data.mediaGallery;
  const numColumnsHPCollections =
    mediaGallery && mediaGallery !== null ? getNumColumns(mediaGallery.length) : 1;

  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${numColumnsHPCollections} gap-4 mt-10 md:mt-20 md:mb-40`}
      >
        {mediaGallery &&
          mediaGallery.length > 0 &&
          mediaGallery.map((fadeImage: any, index: any) => {
            const fadeImageData = fadeImage.attributes; //strapi 5, use directly fadeIMage
            const imageUrl = getStrapiMedia(fadeImageData.url);
            const smallImage =
              fadeImageData?.formats && fadeImageData?.formats.small
                ? fadeImageData?.formats.small
                : "";
            const imageUrlSmall = smallImage && smallImage.url && getStrapiMedia(smallImage.url);

            mediaGalleryMap.push({
              url: imageUrl,
              alt: fadeImageData?.alternativeText || "",
            });
            return (
              <div
                key={index}
                onClick={() => handleImageClick(index)}
                className="cursor-pointer m-auto hover:brightness-125 hover:contrast-115 transition-all duration-30"
              >
                <Image
                  src={imageUrlSmall || imageUrl}
                  alt={fadeImageData?.alternativeText || ""}
                  priority={index <= 1 ? true : false}
                  loading={index <= 1 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 100vw, 100vw"
                  className="w-full h-96 object-cover rounded-lg"
                  height={smallImage ? smallImage.height : fadeImageData.height}
                  width={smallImage ? smallImage.width : fadeImageData.width}
                />
                {fadeImageData.caption && <p className="text-base my-2">{fadeImageData.caption}</p>}
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

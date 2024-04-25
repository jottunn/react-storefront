import { PlayIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getGalleryMedia, getYouTubeIDFromURL } from "@/lib/media";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import MediaModal from "./MediaModal";

export interface ProductGalleryProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
  placeholder?: string | null;
}

export function ProductGallery({ product, selectedVariant, placeholder }: ProductGalleryProps) {
  const galleryMedia = getGalleryMedia({ product, selectedVariant });
  const [isMobile, setIsMobile] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    // Update the state based on viewport width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    // Set the initial value
    handleResize();
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setCurrentIndex(null);
  };
  // console.log(galleryMedia);

  return (
    <>
      {isMobile ? (
        <div className="md:hidden" style={{ height: "100%", maxWidth: "100%" }}>
          <Swiper slidesPerView={1} modules={[Scrollbar]} scrollbar={{ draggable: true }}>
            {galleryMedia.map((media, index) => (
              <SwiperSlide key={index}>
                {media.type === "IMAGE" && (
                  <Image
                    className="m-auto"
                    src={media.url}
                    alt={`Image ${index}`}
                    width={400}
                    height={400}
                    priority={index === 0}
                    loading={index < 1 ? "eager" : "lazy"}
                    style={{ objectFit: "contain" }}
                  />
                )}

                {media.type === "VIDEO" && (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      title={media.alt || "Video"}
                      src={`https://www.youtube.com/embed/${
                        getYouTubeIDFromURL(media.url) as string
                      }`}
                      className="w-full h-full"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div
          className={clsx(
            "mb-2 w-full max-h-screen grid grid-cols-1 gap-6 h-[38rem]",
            galleryMedia.length > 1 && "md:grid-cols-1 md:col-span-1"
          )}
          style={{
            scrollSnapType: "both mandatory",
          }}
        >
          {galleryMedia?.map((media, index) => (
            <div
              key={media.url}
              className="aspect-w-1 aspect-h-1 border"
              style={{ scrollSnapAlign: "start" }}
              onClick={() => handleImageClick(index)}
            >
              {media.type === "IMAGE" && (
                <Image
                  src={media.url}
                  alt={media.alt}
                  width={700}
                  height={700}
                  style={{ objectFit: "contain" }}
                  role="button"
                  tabIndex={-2}
                  priority={index === 0}
                  loading={index < 3 ? "eager" : "lazy"}
                  {...(placeholder !== null
                    ? { placeholder: "blur", blurDataURL: placeholder }
                    : {})}
                />
              )}
              {media.type === "VIDEO" && (
                <div role="button" tabIndex={-2}>
                  {
                    <Image
                      src={media.thumbnailUrl || ""}
                      alt={media.alt}
                      fill={true}
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      unoptimized
                    />
                  }

                  <div className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 absolute w-full h-full flex justify-center items-center bg-transparent">
                    <PlayIcon className="h-12 w-12" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentIndex !== null && (
        <div className="fixed bg-black bg-opacity-70 overlow-hidden min-h-screen min-w-screen h-full w-full top-0 bottom-0 left-0 right-0 z-50">
          <MediaModal
            currentIndex={currentIndex}
            galleryMedia={galleryMedia}
            closeModal={closeModal}
            placeholder={placeholder}
          />
        </div>
      )}
    </>
  );
}

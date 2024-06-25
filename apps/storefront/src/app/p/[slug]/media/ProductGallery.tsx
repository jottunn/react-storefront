"use client";
import { PlayIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { getGalleryMedia, getYouTubeIDFromURL } from "@/lib/media";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";

import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { Keyboard, Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/navigation";
import "swiper/css/keyboard";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const mainSwiperRef = useRef<SwiperRef>(null);

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

  const handleThumbnailClick = (index: number) => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.swiper.slideTo(index);
    }
  };

  // Update active index on slide change
  const onSlideChange = () => {
    if (mainSwiperRef.current) {
      setActiveIndex(mainSwiperRef.current.swiper.activeIndex);
    }
  };

  return (
    <>
      {isMobile ? (
        <div className="md:hidden" style={{ height: "100%", maxWidth: "100%" }}>
          <Swiper slidesPerView={1} modules={[Scrollbar]} scrollbar={{ draggable: true }}>
            {galleryMedia.map((media, index) => (
              <SwiperSlide
                key={index}
                className="items-center justify-center h-full"
                style={{ minHeight: "250px" }}
              >
                {media.type === "IMAGE" && (
                  <div className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center">
                    <Image
                      className="cursor-pointer m-auto"
                      src={media.url}
                      alt={`Image ${index}`}
                      fill
                      style={{ objectFit: "contain" }}
                      priority={index === 0}
                      loading={index < 1 ? "eager" : "lazy"}
                      onClick={() => handleImageClick(index)}
                    />
                  </div>
                )}
                {media.type === "VIDEO" && (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      title={media.alt || "Video"}
                      src={`https://www.youtube.com/embed/${getYouTubeIDFromURL(media.url) as string}`}
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
          className="mb-2 w-full h-full"
          style={{
            scrollSnapType: "both mandatory",
          }}
        >
          {galleryMedia.length > 2 ? (
            <div>
              <Swiper
                ref={mainSwiperRef}
                modules={[Navigation, Keyboard]}
                navigation
                onSlideChange={onSlideChange}
                slidesPerView={1}
                spaceBetween={10}
                keyboard={true}
                className="border"
                style={
                  {
                    "--swiper-navigation-color": "#0b9446",
                    "--swiper-pagination-color": "#0b9446",
                  } as any
                }
              >
                {galleryMedia.map((media, index) => (
                  <SwiperSlide key={media.url} onClick={() => handleImageClick(index)}>
                    {media.type === "IMAGE" && (
                      <div className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center">
                        <Image
                          src={media.url}
                          alt={media.alt}
                          fill
                          style={{ objectFit: "contain" }}
                          className="p-6 mx-auto"
                          role="button"
                          tabIndex={-2}
                          priority={index === 0}
                          loading={index < 5 ? "eager" : "lazy"}
                          {...(placeholder !== null
                            ? { placeholder: "blur", blurDataURL: placeholder }
                            : {})}
                        />
                      </div>
                    )}
                    {media.type === "VIDEO" && (
                      <div
                        role="button"
                        tabIndex={-2}
                        className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center"
                      >
                        <Image
                          src={media.thumbnailUrl || ""}
                          alt={media.alt}
                          fill
                          style={{ objectFit: "contain" }}
                          className="p-6 mx-auto"
                          loading="lazy"
                        />
                        <div className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 absolute top-0 w-full h-full flex justify-center items-center bg-transparent">
                          <PlayIcon className="h-12 w-12" />
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="thumbnail-container mt-6 flex flex-wrap gap-3">
                {galleryMedia.map((media, index) => (
                  <div
                    key={media.url + "-thumb"}
                    className={clsx(
                      "cursor-pointer content-center hover:brightness-110 hover:contrast-115 transition-all duration-30 border-2",
                      { "border-transparent": index !== activeIndex },
                      { "border-action-1": index === activeIndex },
                    )}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    {media.type === "IMAGE" && (
                      <Image
                        src={media.url}
                        alt={media.alt}
                        width={106}
                        height={106}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    {media.type === "VIDEO" && (
                      <div role="button" tabIndex={-2} className="relative">
                        <Image
                          src={media.thumbnailUrl || ""}
                          alt={media.alt}
                          width={106}
                          height={106}
                          style={{ objectFit: "cover", minHeight: "106px" }}
                          loading="lazy"
                        />
                        <div className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 absolute top-0 w-full h-full flex justify-center items-center bg-transparent">
                          <PlayIcon className="h-12 w-12" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            galleryMedia.map((media, index) => (
              <div
                key={media.url}
                className="mb-6"
                style={{ scrollSnapAlign: "start" }}
                onClick={() => handleImageClick(index)}
              >
                {media.type === "IMAGE" && (
                  <div className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center">
                    <Image
                      src={media.url}
                      alt={media.alt}
                      fill
                      style={{ objectFit: "contain" }}
                      className="block mx-auto p-6"
                      role="button"
                      tabIndex={-2}
                      priority={index === 0}
                      loading={index < 3 ? "eager" : "lazy"}
                      {...(placeholder !== null
                        ? { placeholder: "blur", blurDataURL: placeholder }
                        : {})}
                    />
                  </div>
                )}
                {media.type === "VIDEO" && (
                  <div
                    role="button"
                    tabIndex={-2}
                    className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center"
                  >
                    <Image
                      src={media.thumbnailUrl || ""}
                      alt={media.alt}
                      fill
                      style={{ objectFit: "contain" }}
                      className="p-6 mx-auto"
                      loading="lazy"
                    />
                    <div className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 absolute top-0 w-full h-full flex justify-center items-center bg-transparent">
                      <PlayIcon className="h-12 w-12" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {currentIndex !== null && (
        <div className="fixed bg-black bg-opacity-95 md:bg-opacity-70 overlow-hidden min-h-screen min-w-screen h-full w-full top-0 bottom-0 left-0 right-0 z-50">
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

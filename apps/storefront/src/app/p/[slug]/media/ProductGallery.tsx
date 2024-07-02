"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { getGalleryMedia, getYouTubeIDFromURL } from "@/lib/media";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";

import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { Keyboard, Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/navigation";
import "swiper/css/keyboard";
import MediaModal from "./MediaModal";
import Spinner from "@/components/Spinner";

export interface ProductGalleryProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
  placeholder?: string | null;
}

export function ProductGallery({ product, selectedVariant, placeholder }: ProductGalleryProps) {
  const galleryMedia = useMemo(
    () => getGalleryMedia({ product, selectedVariant }),
    [product, selectedVariant],
  );
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const mainSwiperRef = useRef<SwiperRef>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setCurrentIndex(null);
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.swiper.slideTo(index);
    }
  }, []);

  const onSlideChange = useCallback(() => {
    if (mainSwiperRef.current) {
      setActiveIndex(mainSwiperRef.current.swiper.activeIndex);
    }
  }, []);

  const renderGallery = useMemo(() => {
    if (isMobile === null) {
      return (
        <div className="min-h-[350px] md:min-h-[700px] flex items-center justify-center">
          <Spinner />
        </div>
      );
    }
    if (isMobile && galleryMedia.length > 1) {
      return (
        <>
          <Swiper
            slidesPerView={1}
            modules={[Navigation, Scrollbar]}
            scrollbar={{ draggable: true }}
            navigation={{
              prevEl: `.swiper-button-prev-mobile`,
              nextEl: `.swiper-button-next-mobile`,
            }}
          >
            {galleryMedia.map((media, index) => (
              <SwiperSlide key={index}>
                {media.type === "IMAGE" && (
                  <div className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center">
                    <Image
                      className="cursor-pointer m-auto"
                      src={media.url}
                      alt={media.alt || ""}
                      width={300}
                      height={300}
                      style={{ objectFit: "contain" }}
                      priority={index === 0}
                      loading={index < 1 ? "eager" : "lazy"}
                      onClick={() => handleImageClick(index)}
                      {...(placeholder !== null
                        ? { placeholder: "blur", blurDataURL: placeholder }
                        : {})}
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
          <div className="swiper-navigation flex mt-4 mb-0 pb-0 float-right">
            <button className="swiper-button-prev-mobile custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer">
              <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
            </button>
            <button className="swiper-button-next-mobile custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer">
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </>
      );
    } else if (!isMobile && galleryMedia.length > 2) {
      return (
        <div className="bock w-full">
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
                      alt={media.alt || ""}
                      width={700}
                      height={550}
                      style={{ objectFit: "contain" }}
                      className="p-6 mx-auto max-h-[100%] cursor-pointer"
                      priority={index === 0}
                      loading={index < 5 ? "eager" : "lazy"}
                      {...(placeholder !== null
                        ? { placeholder: "blur", blurDataURL: placeholder }
                        : {})}
                    />
                  </div>
                )}
                {media.type === "VIDEO" && (
                  <div className="relative w-full h-[350px] md:h-[700px] border flex items-center justify-center cursor-pointer">
                    <Image
                      src={media.thumbnailUrl || ""}
                      alt={media.alt || ""}
                      width={700}
                      height={700}
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
                    alt={media.alt || ""}
                    width={106}
                    height={106}
                    style={{ objectFit: "cover" }}
                  />
                )}
                {media.type === "VIDEO" && (
                  <div role="button" className="relative">
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
      );
    } else {
      return galleryMedia.map((media, index) => (
        <div
          key={media.url}
          className="mb-6 border w-full"
          style={{ scrollSnapAlign: "start" }}
          onClick={() => handleImageClick(index)}
        >
          {media.type === "IMAGE" && (
            <div className="relative w-full h-[350px] md:h-[700px] flex items-center justify-center">
              <Image
                src={media.url}
                alt={media.alt}
                width={700}
                height={700}
                style={{ objectFit: "contain" }}
                className="block mx-auto p-6 max-h-[100%] cursor-pointer"
                priority={index === 0}
                loading={index < 3 ? "eager" : "lazy"}
                {...(placeholder !== null ? { placeholder: "blur", blurDataURL: placeholder } : {})}
              />
            </div>
          )}
          {media.type === "VIDEO" && (
            <div
              role="button"
              tabIndex={-2}
              className="relative w-full h-[350px] md:h-[700px] flex items-center justify-center"
            >
              <Image
                src={media.thumbnailUrl || ""}
                alt={media.alt}
                width={700}
                height={700}
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
      ));
    }
  }, [isMobile, galleryMedia, activeIndex, handleImageClick, handleThumbnailClick, onSlideChange]);

  return (
    <>
      {renderGallery}
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

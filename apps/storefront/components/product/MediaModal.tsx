import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/keyboard";
import Image from "next/image";
import { XIcon } from "@heroicons/react/outline";
import { EnhancedProductMedia, getYouTubeIDFromURL } from "@/lib/media";
import Spinner from "../Spinner";

export interface ImageModalProps {
  galleryMedia: EnhancedProductMedia[];
  closeModal: () => void;
  currentIndex?: number;
  placeholder?: string | null;
}

const MediaModal = ({ galleryMedia, closeModal, currentIndex, placeholder }: ImageModalProps) => {
  const [loaded, setLoaded] = useState(false);
  const handleIframeLoad = () => {
    setLoaded(true);
  };

  return (
    <div className="min-h-screen absolute overflow-hidden grid grid-cols-1 mx-auto px-8 md:h-full w-full">
      <button
        type="button"
        className="absolute grid content-center justify-center right-0 p-8 h-10 w-10 z-50 mt-10"
        aria-label="Close"
        onClick={closeModal}
      >
        <XIcon className="w-10 h-10 border text-white hover:text-red" />
      </button>
      <div className="container m-auto">
        <Swiper
          modules={[Navigation, EffectFade, Keyboard]}
          navigation
          slidesPerView={1}
          effect="fade"
          keyboard={true}
          style={
            {
              "--swiper-navigation-color": "#fff",
              "--swiper-pagination-color": "#fff",
            } as any
          }
          initialSlide={currentIndex}
        >
          {galleryMedia.map((media, index) => (
            <SwiperSlide key={index} style={{ height: "800px", minWidth: "800px" }}>
              <div className="flex items-center justify-center h-full">
                {media.type === "IMAGE" ? (
                  <Image
                    className="m-auto"
                    src={media.url}
                    alt={`Image ${index}`}
                    width={800}
                    height={800}
                    style={{ objectFit: "contain" }}
                    loading={index === 0 ? "eager" : "lazy"}
                    {...(placeholder !== null
                      ? { placeholder: "blur", blurDataURL: placeholder }
                      : {})}
                  />
                ) : (
                  <div className="w-full h-full">
                    {!loaded && (
                      <>
                        <Image
                          className="m-auto"
                          src={media.thumbnailUrl || ""}
                          alt={`Image ${index}`}
                          fill
                          style={{ objectFit: "contain" }}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 absolute w-full h-full flex justify-center items-center bg-transparent">
                          <Spinner />
                        </div>
                      </>
                    )}
                    {
                      <iframe
                        title={media.alt || "Video"}
                        src={`https://www.youtube.com/embed/${
                          getYouTubeIDFromURL(media.url) as string
                        }?autoplay=1`}
                        className="w-full h-4/5 md:w-4/5 m-auto"
                        onLoad={handleIframeLoad}
                        allow="autoplay"
                        allowFullScreen
                      />
                    }
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default MediaModal;

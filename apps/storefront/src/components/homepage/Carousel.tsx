"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { UPLOAD_FOLDER } from "@/lib/const";
import Link from "next/link";

interface SliderProps {
  slides: any[];
  autoSlideDelay?: number;
}

const Carousel: React.FC<SliderProps> = ({ slides, autoSlideDelay = 6000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  }, [isTransitioning, slides.length]);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    const autoSlideTimer = setInterval(nextSlide, autoSlideDelay);
    return () => clearInterval(autoSlideTimer);
  }, [nextSlide, autoSlideDelay]);

  return (
    <div className="relative w-full max-w-[1920px] mx-auto overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const bannerLink =
            slide.attributes.find(
              (attr: { attribute: { slug: string } }) => attr.attribute.slug === "link",
            )?.values[0]?.name || "#";

          // Get desktop banner
          const desktopBanner = slide.attributes.find(
            (attr: { attribute: { slug: string } }) => attr.attribute.slug === "banner",
          )?.values[0]?.name;

          // Get mobile banner
          const mobileBanner = slide.attributes.find(
            (attr: { attribute: { slug: string } }) => attr.attribute.slug === "banner-mobile",
          )?.values[0]?.name;

          const desktopImgSrc = desktopBanner ? `${UPLOAD_FOLDER ?? ""}/${desktopBanner}` : "";
          const mobileImgSrc = mobileBanner ? `${UPLOAD_FOLDER ?? ""}/${mobileBanner}` : "";

          return (
            <div key={index} className="relative min-w-full flex justify-center">
              <Link href={bannerLink} className="w-full">
                {/* Desktop Image */}
                <div className="hidden md:block relative w-full">
                  <div className="relative" style={{ paddingTop: "calc(550 / 1900 * 100%)" }}>
                    <Image
                      src={desktopImgSrc}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      quality={90}
                      className="object-contain"
                      sizes="(min-width: 768px) 100vw, 0vw"
                    />
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="block md:hidden relative w-full">
                  <div className="relative" style={{ paddingTop: "calc(430 / 700 * 100%)" }}>
                    <Image
                      src={mobileImgSrc || desktopImgSrc} // Fallback to desktop if no mobile
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      quality={90}
                      className="object-contain"
                      sizes="(max-width: 767px) 100vw, 0vw"
                    />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center 
                   rounded-full bg-black/30 text-white transition-all duration-300 hover:bg-action-1/50 
                   hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 z-10
                   md:left-6 md:w-[50px] md:h-[50px]
                   sm:left-4 sm:w-10 sm:h-10"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center 
                   rounded-full bg-black/30 text-white transition-all duration-300 hover:bg-action-1/50 
                   hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 z-10
                   md:right-6 md:w-[50px] md:h-[50px]
                   sm:right-4 sm:w-10 sm:h-10"
        aria-label="Next slide"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 
                       hover:bg-action-1/80 hover:scale-125 focus:outline-none
                       ${currentIndex === index ? "bg-white scale-125" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;

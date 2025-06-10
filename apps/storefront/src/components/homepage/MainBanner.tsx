"use client";

import dynamic from "next/dynamic";
import Carousel from "./Carousel";

const VideoBanner = dynamic(() => import("./VideoBanner"), {
  ssr: false,
});

interface MainBannerProps {
  displayVideo?: {
    __typename?: "MetadataItem";
    key: string;
    value: string;
  };
  videoUrl?: string;
  videoBannerPath?: string;
  aspectRatio?: string;
  displayHomepageCarousel: any[];
  carouselW: string;
  carouselH: string;
  bannerContainerSize?: string;
}

const MainBanner = ({
  displayVideo,
  videoUrl,
  videoBannerPath,
  aspectRatio,
  displayHomepageCarousel,
  carouselW,
  carouselH,
  bannerContainerSize,
}: MainBannerProps) => {
  return (
    <div
      className={`flex overflow-hidden mb-1 md:mb-1 !px-0 ${bannerContainerSize && bannerContainerSize === "YES" ? "" : "max-w-[1920px] mx-auto"}`}
    >
      {displayVideo?.value === "YES" ? (
        <VideoBanner
          videoUrl={typeof videoUrl === "string" ? videoUrl : "#"}
          thumbnailUrl={typeof videoBannerPath === "string" ? videoBannerPath : "#"}
          title=""
          aspectRatio={aspectRatio || "16/9"}
          transitionDuration={1500}
          objectFit="cover"
        />
      ) : (
        <Carousel slides={displayHomepageCarousel} carouselW={carouselW} carouselH={carouselH} />
      )}
    </div>
  );
};

export default MainBanner;

import { getStrapiMedia } from "@/lib/strapi/api-helpers";
import Image from "next/image";
import BlockRendererClient from "./BlocksRendererClient";

export default function Hero({ data }: any) {
  const imgUrl = getStrapiMedia(data?.banner?.data?.attributes?.url);
  return (
    <div className="container flex flex-col justify-center pl-6 pb-14 mx-auto lg:flex-row lg:justify-between">
      <div className="flex flex-col justify-center p-6 text-center rounded-lg xl:max-w-lg lg:text-left">
        {data?.richTextBlocks && <BlockRendererClient content={data?.richTextBlocks} />}
      </div>
      {imgUrl && (
        <div className="flex items-center justify-center p-6 mt-8 lg:mt-0 h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128">
          <Image
            src={imgUrl || ""}
            alt={data?.banner?.data?.attributes?.alternativeText || ""}
            className="object-contain h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128 "
            width={600}
            height={600}
            unoptimized={true}
          />
        </div>
      )}
    </div>
  );
}

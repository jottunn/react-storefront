import { getStrapiMedia } from "@/lib/strapi/api-helpers";
import Image from "next/image";

interface MediaProps {
  singleMedia: {
    data: {
      id: string;
      attributes: {
        url: string;
        name: string;
        alternativeText: string;
      };
    };
  };
}

export default function Media({ data }: { data: MediaProps }) {
  const imgUrl = getStrapiMedia(data.singleMedia.data.attributes.url);
  return (
    <div className="flex items-center justify-center mt-8 lg:mt-0 h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128">
      <img
        src={imgUrl || ""}
        alt={data.singleMedia.data.attributes.alternativeText || ""}
        className="object-cover w-full h-full rounded-lg overflow-hidden"
        width={400}
        height={400}
      />
    </div>
  );
}

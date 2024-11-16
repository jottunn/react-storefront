import { getStrapiMedia } from "@/lib/strapi/api-helpers";
import Image from "next/image";

export default function Media({ data }: { data: any }) {
  const singleMedia = data.singleMedia?.data?.attributes; //strapi5 const singleMedia = data.singleMedia
  const imgUrl = getStrapiMedia(singleMedia?.url);
  return (
    <div className="block">
      <Image
        src={imgUrl || ""}
        alt={singleMedia?.alternativeText || ""}
        priority={false}
        loading="lazy"
        sizes="(max-width: 640px) 100vw, 100vw"
        width={singleMedia?.width || "400"}
        height={singleMedia?.height || "400"}
      />
      {singleMedia?.caption && <p className="text-base my-2">{singleMedia?.caption}</p>}
    </div>
  );
}

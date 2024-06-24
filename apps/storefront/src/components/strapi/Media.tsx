import { generateSrcset, getStrapiMedia } from "@/lib/strapi/api-helpers";

interface MediaProps {
  singleMedia: {
    data: {
      id: string;
      attributes: {
        url: string;
        name: string;
        alternativeText: string;
        caption: string;
        width: number;
        height: number;
      };
    };
  };
}

export default function Media({ data }: { data: MediaProps }) {
  const imgUrl = getStrapiMedia(data?.singleMedia?.data?.attributes?.url);
  const srcSet = generateSrcset(data?.singleMedia?.data?.attributes);
  return (
    <div className="block">
      <img
        src={imgUrl || ""}
        srcSet={srcSet}
        sizes="(max-width: 640px) 100vw, 100vw"
        alt={data?.singleMedia?.data?.attributes?.alternativeText || ""}
        width={data?.singleMedia?.data?.attributes?.width || "400"}
        height={data?.singleMedia?.data?.attributes?.height || "400"}
      />
      {data?.singleMedia?.data?.attributes?.caption && (
        <p className="text-base my-2">{data?.singleMedia?.data?.attributes?.caption}</p>
      )}
    </div>
  );
}

import { STOREFRONT_NAME, UPLOAD_FOLDER } from "@/lib/const";
import Image from "next/image";
import clsx from "clsx";

interface BannerProps {
  bannerAttribute?: any;
  parsedBannerRichText?: string;
  displayTextBanner?: string;
  bannerTextStyle?: string;
  placeholder?: any;
}
export default function Banner({
  bannerAttribute,
  parsedBannerRichText,
  displayTextBanner,
  bannerTextStyle,
  placeholder,
}: BannerProps) {
  return (
    <div className="relative overflow-hidden flex my-0 mx-auto w-full h-full">
      <div className="relative flex h-full w-full overflow-hidden">
        {bannerAttribute?.values[0]?.name && (
          <Image
            key="banner"
            src={`${UPLOAD_FOLDER ?? ""}/${bannerAttribute.values[0].name}`}
            alt={STOREFRONT_NAME}
            className="absolute h-full w-full inset-0 object-cover object-center"
            fill
            sizes="(max-width: 640px) 100vw, 100vw"
            priority={true}
            loading={"eager"}
            {...(placeholder !== null ? { placeholder: "blur", blurDataURL: placeholder } : {})}
          />
        )}
      </div>

      {!(displayTextBanner && displayTextBanner === "NO") && (
        <div
          className={clsx({
            "absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 p-6 md:p-12":
              bannerTextStyle === "full",
            "absolute banner-content left-1/2 transform -translate-x-1/2 bottom-4 md:bottom-28 bg-black bg-opacity-85 py-10 px-18":
              bannerTextStyle !== "full",
          })}
        >
          <div
            className={clsx({
              "container text-md text-left text-white bg-black bg-opacity-70 p-6 sm:bg-transparent sm:p-0 md:text-lg md:prose-2xl banner-text":
                bannerTextStyle === "full",
              "prose-base banner-text text-white": bannerTextStyle !== "full",
            })}
          >
            {parsedBannerRichText && (
              <div dangerouslySetInnerHTML={{ __html: parsedBannerRichText }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

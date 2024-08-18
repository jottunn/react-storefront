import { STOREFRONT_NAME, UPLOAD_FOLDER } from "@/lib/const";
import Image from "next/image";
import clsx from "clsx";
import styles from "./Banner.module.css";

interface BannerProps {
  bannerAttribute?: any;
  parsedBannerRichText?: string;
  displayTextBanner?: string;
  bannerTextStyle?: string;
  placeholder?: any;
  hasBanner2?: boolean;
}
export default function Banner({
  bannerAttribute,
  parsedBannerRichText,
  displayTextBanner,
  bannerTextStyle,
  placeholder,
  hasBanner2,
}: BannerProps) {
  return (
    <div className="relative overflow-hidden flex my-0 mx-auto w-full h-full">
      <div className="relative flex h-full w-full overflow-hidden">
        {bannerAttribute?.values[0]?.name && (
          <Image
            key={bannerAttribute?.values[0]?.name}
            src={`${UPLOAD_FOLDER ?? ""}/${bannerAttribute.values[0].name}`}
            alt={STOREFRONT_NAME}
            className={clsx(
              !hasBanner2 && "absolute h-full object-cover inset-0 ",
              hasBanner2 && "relative object-cover",
              "w-full object-center",
            )}
            {...(!hasBanner2 ? { fill: true } : { width: 1000, height: 700 })}
            sizes="(max-width: 640px) 100vw, 100vw"
            priority={true}
            loading={"eager"}
            {...(placeholder !== null ? { placeholder: "blur", blurDataURL: placeholder } : {})}
          />
        )}
      </div>

      {!(displayTextBanner && displayTextBanner === "NO") && (
        <div
          className={clsx(
            styles[`banner-text-style-${bannerTextStyle?.replace("&", "")}`],
            hasBanner2 && styles["has-banner2"],
          )}
        >
          <div
            className={clsx(
              styles["banner-text"],
              (bannerTextStyle === "full" || bannerTextStyle === "full&background") &&
                " container md:prose-2xl md:text-lg",
            )}
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

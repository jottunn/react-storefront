import Link from "next/link";
import Image from "next/image";
import { CategoryDetailsFragment, CollectionDetailsFragment } from "@/saleor/api";
import { UPLOAD_FOLDER } from "@/lib/const";
import { translate } from "@/lib/translations";
import edjsHTML from "editorjs-html";

export interface HomepageBlockProps {
  item: CategoryDetailsFragment | CollectionDetailsFragment | any;
  type: string;
}

export default function HomepageBlock({ item, type }: HomepageBlockProps) {
  let bannerLink =
    (type === "homepage" &&
      item.attributes.find(
        (attr: { attribute: { slug: string } }) => attr.attribute.slug === "link",
      )?.values[0]?.name) ||
    "#";
  let bannerImg =
    (type === "homepage" &&
      item.attributes.find(
        (attr: { attribute: { slug: string } }) => attr.attribute.slug === "banner",
      )?.values[0]?.name) ||
    "";
  let bannerImgSrc = bannerImg ? `${UPLOAD_FOLDER ?? ""}/${bannerImg}` : "";
  const parser = edjsHTML();
  const emptyTagsRegex = /^<[^>]+>\s*(<br\s*\/?>)?\s*<\/[^>]+>$/;
  const content = item && "content" in item ? translate(item, "content") : null;
  const parsedContent = content ? parser.parse(JSON.parse(content)).join("") : "";
  const isEmptyContent = emptyTagsRegex.test(parsedContent);
  return (
    <div>
      <div className="relative">
        {type && (
          <Link
            href={
              type === "category"
                ? `/c/${item.slug}`
                : type === "collection"
                  ? `/collections/${item.slug}`
                  : bannerLink
            }
            className="text-md mt-2 font-medium text-gray-600 cursor-pointer hover:text-gray-700"
          >
            <Image
              className="hover:brightness-125 hover:contrast-115 transition-all duration-30 cover w-full"
              src={bannerImgSrc ? bannerImgSrc : item.backgroundImage?.url || ""}
              alt={bannerImgSrc ? item.title : item.backgroundImage?.alt || item.name}
              width={600}
              height={485}
              sizes={"(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"}
              priority={false}
              loading={"lazy"}
            />
            {type !== "homepage" && (
              <h3 className="text-md uppercase mt-3 font-bold">{item.name}</h3>
            )}
            {parsedContent && !isEmptyContent && (
              <div
                className="text-md uppercase mt-3 font-bold text-center"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />
            )}
          </Link>
        )}
      </div>
      {item.backgroundImage?.alt && <p className="text-sm pt-2">{item.backgroundImage?.alt}</p>}
    </div>
  );
}

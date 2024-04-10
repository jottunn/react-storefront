import usePaths from "@/lib/paths";
import { CategoryDetailsFragment, CollectionDetailsFragment } from "@/saleor/api";
import Link from "next/link";
export interface HomepageBlockProps {
  item: CategoryDetailsFragment | CollectionDetailsFragment;
  type: string;
}

export function HomepageBlock({ item, type }: HomepageBlockProps) {
  const paths = usePaths();
  const jsonData = item.description ? JSON.parse(item.description) : "";
  return (
    <div>
      {type && (
        <Link
          href={
            type === "category"
              ? paths.category._slug(item.slug).$url()
              : paths.collection._slug(item.slug).$url()
          }
          passHref
          legacyBehavior
        >
          <a className="text-md mt-2 font-medium text-gray-600 cursor-pointer hover:text-gray-700">
            <img
              className="hover:brightness-125 hover:contrast-115 transition-all duration-30"
              src={item?.backgroundImage?.url}
              alt={item?.backgroundImage?.alt || ""}
            />
            <h3 className="text-lg uppercase mt-3">{item.name}</h3>
          </a>
        </Link>
      )}
      {jsonData && jsonData.blocks.length > 0 && jsonData.blocks[0].data && (
        <p className="text-sm pt-2">{jsonData.blocks[0].data.text}</p>
      )}
    </div>
  );
}

export default HomepageBlock;

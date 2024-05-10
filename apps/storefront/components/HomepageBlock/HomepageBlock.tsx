import usePaths from "@/lib/paths";
import { CategoryDetailsFragment, CollectionDetailsFragment } from "@/saleor/api";
import Link from "next/link";
import Image from "next/image";
export interface HomepageBlockProps {
  item: CategoryDetailsFragment | CollectionDetailsFragment;
  type: string;
}

export function HomepageBlock({ item, type }: HomepageBlockProps) {
  const paths = usePaths();
  const jsonData = item.description ? JSON.parse(item.description) : "";
  return (
    <div>
      <div className="relative">
        {type && (
          <Link
            href={
              type === "category"
                ? paths.categories._slug(item.slug).$url()
                : paths.collections._slug(item.slug).$url()
            }
            passHref
            legacyBehavior
            aria-label={item.name}
          >
            <a className="text-md mt-2 font-medium text-gray-600 cursor-pointer hover:text-gray-700">
              <Image
                className="hover:brightness-125 hover:contrast-115 transition-all duration-30"
                src={item.backgroundImage?.url || ""}
                alt={item.backgroundImage?.alt || item.name}
                width={type === "category" ? 700 : 600}
                height={type === "category" ? 425 : 485}
                sizes={
                  type === "category"
                    ? "(max-width: 640px) 100vw, 50vw"
                    : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                }
                priority={false}
                loading={"lazy"}
              />
              <h3 className="text-lg uppercase mt-3">{item.name}</h3>
            </a>
          </Link>
        )}
      </div>
      {jsonData && jsonData.blocks.length > 0 && jsonData.blocks[0].data && (
        <p className="text-sm pt-2">{jsonData.blocks[0].data.text}</p>
      )}
    </div>
  );
}

export default HomepageBlock;

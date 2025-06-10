import { getStrapiMedia } from "@/lib/strapi/api-helpers";
import Link from "next/link";
import Image from "next/image";

export function BlogItem({ blog }: { blog: any }) {
  const blogData = blog.attributes; //strapi5 to remove, use blog
  const coverImage = blogData.coverImage.data.attributes; //strapi5 const coverImage = blog.coverImage.
  const imgUrl = getStrapiMedia(coverImage.url);
  const category = blogData.categories.data[0]?.attributes.slug || "bikes";
  //strapi5 const category = blog.categories[0]?.slug || "bikes";

  return (
    <Link href={`/blog/${category}/${blogData.slug}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[45%_55%] md:items-center md:border-t md:border-gray-200 mb-8 md:mb-2 hover:text-gray-700">
        <div>
          <h2 className="text-lg uppercase pt-2">{blogData.title}</h2>
          <p>{blogData.excerpt}</p>
        </div>

        <Image
          src={imgUrl || ""}
          alt={coverImage.alternativeText || ""}
          priority={false}
          loading="lazy"
          className="hover:brightness-105 hover:contrast-115 transition-all duration-30"
          sizes="(max-width: 640px) 100vw, 100vw"
          width={700}
          height={600}
        />
      </div>
    </Link>
  );
}

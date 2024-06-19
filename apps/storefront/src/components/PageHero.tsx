import React from "react";
import Link from "next/link";
import Box from "./Box";
import RichText from "./RichText";

export interface PageHeroProps {
  title: string;
  description?: string;
  pills?: {
    label: string;
    slug: string;
  }[];
  parents?: {
    label: string;
    slug: string;
  }[];
}

export function PageHero({ title, description, pills = [], parents = [] }: PageHeroProps) {
  return (
    <Box>
      <div className="text-center">
        <h1 className="text-4xl font-bold" data-testid={`titleOf${title}`}>
          {title}
        </h1>

        {description && (
          <div className="text-lg inline-block sm:block my-6 text-main-1">
            <RichText jsonStringData={description} />
          </div>
        )}
        {pills.length > 0 && (
          <div className="hidden md:flex md:gap-2 md:flex-wrap md:items-center md:justify-center md:mt-5 mb-4">
            {pills.map((pill) => (
              <Link
                key={pill.label}
                href={`/c/${pill.slug}`}
                className="cursor-pointer h-10 py-2 inline-flex items-center border border-gray-400 text-base hover:border-action-1 hover:text-action-1 whitespace-nowrap px-4"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
}

export default PageHero;

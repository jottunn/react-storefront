import { ChipButton } from "@saleor/ui-kit";
import React from "react";
import { Box } from "../Box";
import { RichText } from "../RichText";
import Link from "next/link";
import { usePaths } from "@/lib/paths";

export interface PageHeroProps {
  title: string;
  description?: string;
  pills?: {
    label: string;
    onClick: () => void;
  }[];
  parents?: {
    label: string;
    slug: string;
  }[];
}

export function PageHero({ title, description, pills = [], parents = [] }: PageHeroProps) {
  const paths = usePaths();
  return (
    <Box>
      <div className="text-center">
        {parents.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center justify-center mb-4">
            {parents.map((parent, i) => (
              <React.Fragment key={parent.slug}>
                <Link href={paths.category._slug(parent.slug).$url()} passHref legacyBehavior>
                  <a className="text-base mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600">
                    {parent.label}
                  </a>
                </Link>
                <span className="text-gray-600 mt-2 text-base">/</span>
                <span className="text-base mt-2 font-medium text-gray-500">{title}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-4xl font-bold" data-testid={`titleOf${title}`}>
          {title}
        </h1>

        {description && (
          <div className="text-lg inline-block sm:block my-6 text-main-1">
            <RichText jsonStringData={description} />
          </div>
        )}
        {pills.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center justify-center mt-5 mb-4">
            {pills.map((pill) => (
              <ChipButton
                key={pill.label}
                label={pill.label}
                onClick={pill.onClick}
                className="!rounded-none"
              />
            ))}
          </div>
        )}
      </div>
    </Box>
  );
}

export default PageHero;

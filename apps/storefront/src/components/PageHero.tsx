"use client";
import React from "react";
import Link from "next/link";

export interface PageHeroProps {
  title: React.ReactNode;
  pills?: {
    label: string;
    slug: string;
  }[];
}

export function PageHero({ title, pills = [] }: PageHeroProps) {
  return (
    <div className="text-center">
      <h1 className="text-4xl" data-testid={`titleOf${title}`}>
        {title}
      </h1>
      {pills.length > 0 && (
        <div className="hidden md:flex md:gap-2 md:flex-wrap md:items-center md:justify-center my-4 md:mt-6">
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
  );
}

export default PageHero;

import { useRouter } from "next/router";
import React from "react";

import { LOCALES } from "@/lib/regions";

import { useRegions } from "../RegionsProvider";
import { BaseRegionsDropdown, HorizontalAlignment } from "./BaseRegionsDropdown";
import { BaseRegionsDropdownItem } from "./BaseRegionsDropdownItem";

interface DropdownOption {
  label: string;
  chosen: boolean;
  localeSlug: string;
}

export interface LocaleDropdownProps {
  horizontalAlignment?: HorizontalAlignment;
}

export function LocaleDropdown({ horizontalAlignment }: LocaleDropdownProps) {
  const router = useRouter();
  const { currentLocale } = useRegions();

  const localeOptions: DropdownOption[] = LOCALES.map((loc) => ({
    label: loc.name,
    chosen: loc.slug === currentLocale,
    localeSlug: loc.slug,
  }));

  const onLocaleChange = (localeSlug: string) => {
    if (localeSlug === currentLocale) {
      return;
    }

    // Update current URL to use the chosen locale
    const { pathname, asPath, query } = router;
    // change just the locale and maintain all other route information including urls query
    void router.push({ pathname, query }, asPath, { locale: localeSlug });
  };

  return (
    <BaseRegionsDropdown label={currentLocale} horizontalAlignment={horizontalAlignment}>
      {localeOptions.map((option) => (
        <BaseRegionsDropdownItem
          key={option.label}
          chosen={option.chosen}
          label={option.label}
          onClick={() => onLocaleChange(option.localeSlug)}
        />
      ))}
    </BaseRegionsDropdown>
  );
}

export default LocaleDropdown;

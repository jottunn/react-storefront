"use client";

import { useEffect, useState } from "react";
import { type CountryCode } from "saleor/api";
import { DEFAULT_CHANNEL } from "../regions";
import { getChannelCountries } from "src/app/actions";

interface UseAvailableShippingCountries {
  availableShippingCountries: CountryCode[];
}

export const useAvailableShippingCountries = (): UseAvailableShippingCountries => {
  const [availableShippingCountries, setAvailableShippingCountries] = useState<CountryCode[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countries = await getChannelCountries(DEFAULT_CHANNEL.slug);
        // Extract the country codes from the array of country objects
        const countryCodes: CountryCode[] = (countries || []).map(
          (country) => country.code as CountryCode,
        );
        setAvailableShippingCountries(countryCodes);
      } catch (error) {
        console.error("Failed to fetch available shipping countries:", error);
      }
    };

    fetchCountries();
  }, []);

  return { availableShippingCountries };
};

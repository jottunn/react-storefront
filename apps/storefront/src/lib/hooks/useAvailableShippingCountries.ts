import { useMemo } from "react";
import { type CountryCode, useChannelQuery } from "saleor/api";
import { DEFAULT_CHANNEL } from "../regions";

interface UseAvailableShippingCountries {
  availableShippingCountries: CountryCode[];
}

export const useAvailableShippingCountries = (): UseAvailableShippingCountries => {
  const { data } = useChannelQuery({
    variables: { slug: DEFAULT_CHANNEL.slug },
  });

  const availableShippingCountries: CountryCode[] = useMemo(
    () => (data?.channel?.countries?.map(({ code }) => code) as CountryCode[]) || [],
    [data?.channel?.countries],
  );

  return { availableShippingCountries };
};

import { useMemo } from "react";
import { type CountryCode, useChannelQuery } from "saleor/api";
import { useRegions } from "@/components/RegionsProvider";

interface UseAvailableShippingCountries {
  availableShippingCountries: CountryCode[];
}

export const useAvailableShippingCountries = (): UseAvailableShippingCountries => {
  const { currentChannel } = useRegions();

  const { data } = useChannelQuery({
    variables: { slug: currentChannel.slug },
  });

  const availableShippingCountries: CountryCode[] = useMemo(
    () => (data?.channel?.countries?.map(({ code }) => code) as CountryCode[]) || [],
    [data?.channel?.countries]
  );

  return { availableShippingCountries };
};

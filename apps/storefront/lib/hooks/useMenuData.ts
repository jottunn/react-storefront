import { useMemo } from "react";
import { useMainMenuQuery, useMainRightMenuQuery } from "@/saleor/api";
import { useRegions } from "@/components/RegionsProvider";

const useMenuData = () => {
  const { query } = useRegions();

  const { error, data } = useMainMenuQuery({
    variables: { ...query },
    fetchPolicy: "cache-and-network",
  });

  const { error: rightMenuError, data: rightMenuData } = useMainRightMenuQuery({
    variables: { ...query },
    fetchPolicy: "cache-and-network",
  });

  const menuItems = useMemo(() => data?.menu?.items || [], [data]);
  const rightMenuItems = useMemo(() => rightMenuData?.menu?.items || [], [rightMenuData]);

  return {
    menuItems,
    rightMenuItems,
    error: error || rightMenuError,
  };
};

export default useMenuData;

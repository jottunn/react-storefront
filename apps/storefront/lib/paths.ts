import { useRegions } from "@/components/RegionsProvider";
import { pagesPath } from "@/lib/$path";
import { DEFAULT_CHANNEL } from "./regions";

export const usePaths = () => {
  const { currentChannel } = useRegions();
  if (currentChannel !== DEFAULT_CHANNEL) {
    return pagesPath; // + '?channel=channel-pln'; //._locale(locale);
  }
  return pagesPath; //._channel(currentChannel.slug)._locale(locale);
};

export default usePaths;

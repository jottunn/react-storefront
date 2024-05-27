import { Client } from "urql";
import { GetChannelsDocument } from "../../../generated/graphql";

export async function getChannelId(client: Client, channelName: string) {
  const getChannels = await client.query(GetChannelsDocument, {});
  const fetchedChannels = getChannels.data?.channels;
  if (fetchedChannels && channelName) {
    for (let c = 0; c < fetchedChannels.length; c++) {
      if (fetchedChannels[c]["slug"] === channelName) {
        return fetchedChannels[c]["id"];
      }
    }
  }
  return fetchedChannels?.map((fetchedChannels) => fetchedChannels.id);
}

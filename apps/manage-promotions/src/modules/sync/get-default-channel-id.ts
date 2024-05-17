import { Client } from "urql";
import { GetChannelsDocument } from "../../../generated/graphql";

export async function getDefaultChannelId(client: Client) {
  const getChannels = await client.query(GetChannelsDocument, {});
  const fetchedChannels = getChannels.data?.channels;
  if (fetchedChannels) {
    for (let c = 0; c < fetchedChannels.length; c++) {
      if (fetchedChannels[c]["slug"] == "default-channel") {
        return fetchedChannels[c]["id"];
      }
    }
  }
  return "";
}

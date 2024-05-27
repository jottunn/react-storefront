import { UpdateCollectionChannelDocument } from "../../../generated/graphql";
import { Client } from "urql";
import { getChannelId } from "../sync/get-channel-id";

export async function unpublishCollection(
  client: Client,
  promoCollectionId: string,
  channels: any[]
) {
  let channelIDs: string[] = [];

  for (let i = 0; i < channels.length; i++) {
    const channelID = await getChannelId(client, channels[i]["slug"]);
    if (channelID) {
      channelIDs.push(channelID as string);
    }
  }
  const { data: updatedCollectionVisibility } = await client
    .mutation(UpdateCollectionChannelDocument, {
      id: promoCollectionId,
      input: {
        removeChannels: channelIDs,
      },
    })
    .toPromise();
}

export async function publishCollection(
  client: Client,
  promoCollectionId: string,
  channels: any[]
) {
  let channelsArray: any[] = [];

  for (let i = 0; i < channels.length; i++) {
    const channelID = await getChannelId(client, channels[i]["slug"]);
    if (channelID) {
      let channelObj = {
        channelId: channelID as string,
        isPublished: true,
      };
      channelsArray.push(channelObj);
    }
  }
  const { data: updatedCollectionVisibility } = await client
    .mutation(UpdateCollectionChannelDocument, {
      id: promoCollectionId,
      input: {
        addChannels: channelsArray,
      },
    })
    .toPromise();
}

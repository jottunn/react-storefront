import { UpdateCollectionChannelDocument } from "../../../generated/graphql";
import { Client } from "urql";
import { getChannelId } from "../sync/get-channel-id";

export async function unpublishCollection(
  client: Client,
  saleCollectionId: string,
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
      id: saleCollectionId,
      input: {
        removeChannels: channelIDs,
      },
    })
    .toPromise();
}

export async function publishCollection(client: Client, saleCollectionId: string, channels: any[]) {
  let channelsArray: any[] = [];
  let receivedChannel = channels;
  if (receivedChannel.length == 0) {
    receivedChannel.push("default-channel");
  }
  console.log("receivedChannel", receivedChannel);
  for (let i = 0; i < receivedChannel.length; i++) {
    const channelID = await getChannelId(client, receivedChannel[i]["slug"] || receivedChannel[i]);
    if (channelID) {
      let channelObj = {
        channelId: channelID as string,
        isPublished: true,
      };
      channelsArray.push(channelObj);
    }
  }

  if (channelsArray && channelsArray.length > 0) {
    const { data: updatedCollectionVisibility } = await client
      .mutation(UpdateCollectionChannelDocument, {
        id: saleCollectionId,
        input: {
          addChannels: channelsArray,
        },
      })
      .toPromise();
    console.log(
      "updatedCollectionVisibility",
      updatedCollectionVisibility,
      saleCollectionId,
      channelsArray
    );
  }
}

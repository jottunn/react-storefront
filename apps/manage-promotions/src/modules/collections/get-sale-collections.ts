import { Client } from "urql";
import { CollectionFilterInput, CollectionsByMetaKeyDocument } from "../../../generated/graphql";

export async function fetchSaleCollections(
  client: Client,
  collectionFilter: CollectionFilterInput
) {
  const { data: saleCollections } = await client.query(
    CollectionsByMetaKeyDocument,
    {
      filter: collectionFilter,
      // published: ["PUBLISHED", "HIDDEN"],
      channel: "default-channel",
      first: 100,
    },
    { requestPolicy: "network-only" }
  );

  //console.log('CollectionsByMetaKeyDocument', saleCollections);
  return saleCollections?.collections?.edges.map((e: { node: any }) => e.node) || [];
}

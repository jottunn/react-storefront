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
      published: ["PUBLISHED", "HIDDEN"],
    },
    { requestPolicy: "network-only" }
  );

  return saleCollections?.collections?.edges.map((e: { node: any }) => e.node) || [];
}

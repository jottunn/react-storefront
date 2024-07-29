import { Client } from "urql";
import { ProductCollectionDocument, ProductFilterInput } from "../../generated/graphql";

export async function fetchProducts(client: Client, productFilter?: ProductFilterInput) {
  const { data } = await client.query(
    ProductCollectionDocument,
    {
      filter: productFilter,
      channel: "default-channel",
    },
    { requestPolicy: "network-only" }
  );

  return data?.products?.edges.map((e: { node: any }) => e.node) || [];
}

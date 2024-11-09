import { Client } from "urql";
import { ProductCollectionDocument, ProductFilterInput } from "../../generated/graphql";

export async function fetchProducts(
  client: Client,
  productFilter?: ProductFilterInput,
  lastCursor?: string | null,
  pageSize: number = 100
) {
  const { data } = await client.query(
    ProductCollectionDocument,
    {
      filter: productFilter,
      channel: "default-channel",
      first: pageSize,
      after: lastCursor,
    },
    { requestPolicy: "network-only" }
  );

  // return data?.products?.edges.map((e: { node: any }) => e.node) || [];
  return {
    products: data?.products?.edges.map((e: { node: any }) => e.node) || [],
    pageInfo: data?.products?.pageInfo || null, // Added to return pageInfo
  };
}

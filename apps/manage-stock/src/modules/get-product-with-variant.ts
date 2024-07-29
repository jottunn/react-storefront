import { Client } from "urql";
import {
  GetProductVariantBySkuDocument,
  ProductCollectionDocument,
  ProductFilterInput,
} from "../../generated/graphql";

export async function getProductWithVariant(client: Client, sku: string) {
  const { data } = await client.query(
    GetProductVariantBySkuDocument,
    {
      sku: sku,
    },
    { requestPolicy: "network-only" }
  );
  return data?.productVariant?.product?.id;
}

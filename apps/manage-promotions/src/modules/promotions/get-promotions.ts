import { Client } from "urql";
import { GetAllPromotionsDocument } from "../../../generated/graphql";

export async function fetchPromotions(client: Client) {
  const { data: availablePromotions } = await client.query(
    GetAllPromotionsDocument,
    {},
    { requestPolicy: "network-only" }
  );
  if (!availablePromotions) {
    return [];
  }
  return availablePromotions.promotions?.edges.map((e: { node: any }) => e.node.id) || [];
}

import { Client } from "urql";
import { GetAllPromotionsDocument } from "../../../generated/graphql";

export async function fetchPromotions(client: Client, id = true) {
  const { data: availablePromotions } = await client.query(
    GetAllPromotionsDocument,
    {},
    { requestPolicy: "network-only" }
  );
  if (!availablePromotions) {
    return [];
  }
  if (id) {
    return availablePromotions.promotions?.edges.map((e: { node: any }) => e.node.id) || [];
  }
  return availablePromotions.promotions?.edges.map((e: { node: any }) => e.node) || [];
}

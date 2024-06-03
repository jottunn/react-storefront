import { Client } from "urql";
import { GetAllSalesDocument } from "../../../generated/graphql";

export async function fetchSales(client: Client, id = true) {
  const { data: availableSales } = await client.query(
    GetAllSalesDocument,
    {},
    { requestPolicy: "network-only" }
  );
  if (!availableSales) {
    return [];
  }
  if (id) {
    return availableSales.sales?.edges.map((e: { node: any }) => e.node.id) || [];
  }
  return availableSales.sales?.edges.map((e: { node: any }) => e.node) || [];
}

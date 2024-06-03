import { Client } from "urql";
import { UpdateSaleDocument } from "../../../generated/graphql";

export async function updateProductsSales(
  client: Client,
  saleId: string,
  // ruleId: string,
  saleProducts: string[]
) {
  const { data: addProductsToSale } = await client
    .mutation(UpdateSaleDocument, {
      id: saleId,
      input: { products: saleProducts },
    })
    .toPromise();

  const errs = addProductsToSale?.saleUpdate?.errors;
  return errs;
}

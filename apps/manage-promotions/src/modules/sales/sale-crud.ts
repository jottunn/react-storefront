import { Client } from "urql";
import { UpdateSaleDocument } from "../../../generated/graphql";

export async function updateSalesCollections(
  client: Client,
  saleId: string,
  // ruleId: string,
  saleCollectionIds: string[]
) {
  const { data: addCollectionsToSale } = await client
    .mutation(UpdateSaleDocument, {
      id: saleId,
      input: { collections: saleCollectionIds },
    })
    .toPromise();

  console.log("addProductsToSale?.saleUpdate", addCollectionsToSale?.saleUpdate);

  const errs = addCollectionsToSale?.saleUpdate?.errors;
  return errs;
}

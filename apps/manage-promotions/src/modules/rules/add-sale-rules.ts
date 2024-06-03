import { Client } from "urql";
import {
  CollectionFilterInput,
  InputMaybe,
  ProductCollectionDocument,
  ProductFilterInput,
  StockAvailability,
} from "../../../generated/graphql";
import { updateProductsSales } from "../sales/sale-crud";
import { fetchSaleCollections } from "../collections/get-sale-collections";
import { updateSalesCollectionPrivateMetadata } from "../collections/collection-crud";

export async function addRules(
  client: Client,
  saleId: string,
  // ruleId: string,
  selectedCategories: string[],
  selectedCollections: string[]
) {
  const errors = [];
  try {
    //get products
    const productsFilter: ProductFilterInput = {
      ...(selectedCategories?.length && { categories: selectedCategories }),
      ...(selectedCollections?.length && { collections: selectedCollections }),
      stockAvailability: "IN_STOCK" as InputMaybe<StockAvailability>,
      isPublished: true,
      isVisibleInListing: true,
    };
    const { data: resultProducts, error: resultProductsErr } = await client.query(
      ProductCollectionDocument,
      { filter: productsFilter },
      { requestPolicy: "network-only" }
    );
    //update collection's privateData
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "sale", value: saleId }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    // console.log(saleCollectionsArr);
    if (saleCollectionsArr && saleCollectionsArr.length > 0) {
      const saleCollectionId = saleCollectionsArr?.[0]?.id;
      // console.log('saleCollectionId', saleCollectionId);
      const metaValues = JSON.stringify([
        { categories: selectedCategories, collections: selectedCollections },
      ]);
      if (saleCollectionId) {
        await updateSalesCollectionPrivateMetadata(client, saleCollectionId, [
          { key: "AndRules", value: metaValues },
        ]);
      }

      if (resultProducts) {
        const productIdsArray =
          resultProducts.products?.edges.map((e: { node: any }) => e.node.id) || [];
        // console.log("products", productIdsArray);
        if (productIdsArray) {
          const err = await updateProductsSales(client, saleId, productIdsArray);
          if (err && err.length > 0) {
            errors.push(err[0]);
          }
        }
      }
    } else {
      errors.push("No Sales collection found for the updated");
    }
    return errors;
  } catch (error) {
    console.error("Error updating sale:", error);
    throw error;
  }
}

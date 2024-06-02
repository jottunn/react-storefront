import { Client } from "urql";
import {
  InputMaybe,
  ProductCollectionDocument,
  ProductFilterInput,
  StockAvailability,
} from "../../../generated/graphql";

export async function addRules(
  client: Client,
  promotionId: string,
  selectedCategories: string[],
  selectedCollections: string[]
) {
  try {
    console.log(`Updating promotion ${promotionId}`);
    console.log(selectedCategories);
    console.log(selectedCollections);
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

    if (resultProducts) {
      const products = resultProducts.products?.edges.map((e: { node: any }) => e.node.id) || [];
      console.log("products", products);
    }
    //update promotion, remove all existing products, add the new
  } catch (error) {
    console.error("Error updating promotion:", error);
  }
}

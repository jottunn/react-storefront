import { Client } from "urql";
import {
  AttributeInput,
  CollectionFilterInput,
  InputMaybe,
  ProductCollectionDocument,
  ProductFilterInput,
  StockAvailability,
} from "../../../generated/graphql";
import { updateProductsSales } from "../sales/sale-crud";
import { fetchSaleCollections } from "../collections/get-sale-collections";
import { updateSalesCollectionPrivateMetadata } from "../collections/collection-crud";
import { l } from "vite/dist/node/types.d-aGj9QkWt";

export async function addRules(
  client: Client,
  saleId: string,
  // ruleId: string,
  selectedCategories: string[],
  selectedCollections: string[],
  brandCollections: any[],
  allCollections: string[]
) {
  const errors = [];
  try {
    let productIdsArray = [];
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
        { categories: selectedCategories, collections: allCollections },
      ]);
      if (saleCollectionId) {
        if (
          selectedCategories.length === 0 &&
          selectedCollections.length === 0 &&
          brandCollections.length === 0
        ) {
          //check if saleCollection has privateMetadata and is not empty,
          //if not, skip everything
          //if yes, continue
          const privateMetadata = saleCollectionsArr?.[0]?.privateMetadata;
          const andRulesItem = privateMetadata.find(
            (item: { key: string }) => item.key === "AndRules"
          );
          if (andRulesItem) {
            const rules = JSON.parse(andRulesItem.value);
            if (rules.categories.length === 0 && rules.collections.length === 0) {
              return;
            }
          }
        }
        await updateSalesCollectionPrivateMetadata(client, saleCollectionId, [
          { key: "AndRules", value: metaValues },
        ]);
      }
    } else {
      errors.push("No Sales collection found for the updated sale.");
    }

    if (
      selectedCategories.length === 0 &&
      selectedCollections.length === 0 &&
      brandCollections.length === 0
    ) {
      //if both categories and collections are empty, remove all assigned products
      console.log("remove all products from discount and remove AndRules privateData");
    } else {
      //build attributesFilter for brands
      let attributesInput = [];
      if (brandCollections && brandCollections.length > 0) {
        const brandSlugs = brandCollections.map((brandCollection) => brandCollection.slug);
        attributesInput.push({
          slug: "brand",
          values: brandSlugs,
        });
      }

      const productsFilter: ProductFilterInput = {
        ...(selectedCategories?.length && { categories: selectedCategories }),
        ...(selectedCollections?.length && { collections: selectedCollections }),
        attributes: attributesInput,
        stockAvailability: "IN_STOCK" as InputMaybe<StockAvailability>,
        isPublished: true,
        isVisibleInListing: true,
      };

      //console.log('attributesInput', attributesInput);
      //console.log('productsFilter', productsFilter);
      const { data: resultProducts, error: resultProductsErr } = await client.query(
        ProductCollectionDocument,
        { filter: productsFilter },
        { requestPolicy: "network-only" }
      );
      if (resultProducts) {
        productIdsArray = resultProducts.products?.edges.map((e: { node: any }) => e.node.id) || [];
      }
      // console.log("products", productIdsArray);
    }

    //update sale with products list
    const err = await updateProductsSales(client, saleId, productIdsArray);
    if (err && err.length > 0) {
      errors.push(err[0]);
    }

    return errors;
  } catch (error) {
    console.error("Error updating sale:", error);
    throw error;
  }
}

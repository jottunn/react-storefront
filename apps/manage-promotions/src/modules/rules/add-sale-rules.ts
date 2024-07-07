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

export async function addRules(
  client: Client,
  saleId: string,
  // ruleId: string,
  selectedCategories: string[],
  finalCategories: string[],
  selectedCollections: string[],
  brandCollections: any[],
  allCollections: string[]
) {
  console.log("add rule for ", saleId);
  console.log("selectedCategories ", selectedCategories);
  console.log("finalCategories ", finalCategories);
  console.log("selectedCollections ", selectedCollections);
  console.log("brandCollections ", brandCollections);
  console.log("allCollections ", allCollections);
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
            const rulesParsed = JSON.parse(andRulesItem.value);
            const rules = rulesParsed[0];
            console.log("rules", rules);
            if (
              (!rules.categories || rules.categories.length === 0) &&
              (!rules.collections || rules.collections.length === 0)
            ) {
              return;
            }
          }
        }
        const responseUpdateRules = await updateSalesCollectionPrivateMetadata(
          client,
          saleCollectionId,
          [{ key: "AndRules", value: metaValues }]
        );
        console.log("metaValues", metaValues);
        console.log(responseUpdateRules);
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
        ...(finalCategories?.length && { categories: finalCategories }),
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

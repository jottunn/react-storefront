import { Client } from "urql";
import {
  GetProductVariantByIdDocument,
  InputMaybe,
  ProductCollectionDocument,
  ProductFilterInput,
  StockAvailability,
} from "../../../generated/graphql";

export async function fetchPromotionsProducts(
  client: Client,
  promotionRules: { __typename?: "PromotionRule" | undefined; cataloguePredicate?: any }[]
) {
  let uniqueProductIds: Set<string> = new Set();
  let categoryIDsSet: Set<string> = new Set();
  let collectionIDsSet: Set<string> = new Set();

  for (const rule of promotionRules) {
    const catalogRules = rule.cataloguePredicate.OR;
    if (catalogRules) {
      for (const catalogRule of catalogRules) {
        if (catalogRule.productPredicate) {
          catalogRule.productPredicate.ids.forEach((id: string) => uniqueProductIds.add(id));
        }
        if (catalogRule.categoryPredicate) {
          catalogRule.categoryPredicate.ids.forEach((id: string) => {
            categoryIDsSet.add(id);
          });
        }
        if (catalogRule.collectionPredicate) {
          catalogRule.collectionPredicate.ids.forEach((id: string) => {
            collectionIDsSet.add(id);
          });
        }
        if (catalogRule.variantPredicate) {
          //get product with variant
          for (const variantId of catalogRule.variantPredicate.ids) {
            const { data: productWithVariant } = await client.query(GetProductVariantByIdDocument, {
              id: variantId,
            });
            const prodId = productWithVariant?.productVariant?.product.id;
            if (prodId) {
              uniqueProductIds.add(prodId);
            }
          }
        }
      }
    }
  }
  const categoryIDsArray = Array.from(categoryIDsSet);
  const collectionIDsArray = Array.from(collectionIDsSet);

  if (categoryIDsArray.length || collectionIDsArray.length) {
    const productsFilter: ProductFilterInput = {
      ...(categoryIDsArray?.length && { categories: categoryIDsArray }),
      ...(collectionIDsArray?.length && { collections: collectionIDsArray }),
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
      resultProducts.products?.edges.forEach((product) => {
        //console.log('product', product);
        uniqueProductIds.add(product.node.id);
      });
    }
  }

  const productIdsArray = Array.from(uniqueProductIds);
  return productIdsArray;
}

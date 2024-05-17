import { Client } from "urql";
import { fetchPromotions } from "../promotions/get-promotions";
import {
  CollectionFilterInput,
  GetPromotionByIdDocument,
  SaleSortField,
  UpdateCollectionDocument,
} from "../../../generated/graphql";
import { fetchSaleCollections } from "../collections/get-sale-collections";
import {
  createCollection,
  deleteCollection,
  updateProductsCollection,
} from "../collections/collection-crud";
import { fetchPromotionsProducts } from "../promotions/get-promotion-products";
import { titleToSlug } from "../../lib/to-slug";
/**
 * 1. get all promotions
 * 2. get all sales collections
 * 3. if any sales collection not in current promotion, delete sales collection (orphan)
 * 4. if any promotion, but no sales collection associated to it, create one
 * 5. sync the products added to sales collection
 */
export const sync = async (client: Client) => {
  let messages = [];
  //1.
  const availablePromotions = await fetchPromotions(client);
  //2.
  const collectionFilter: CollectionFilterInput = {
    metadata: [{ key: "isSale", value: "YES" }],
  };
  const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
  //3.
  const existingSalesCollections: any[] = [];
  for (const saleCollection of saleCollectionsArr) {
    const promotionId = saleCollection.metadata.find(
      (item: { key: string }) => item.key === "promotion"
    )?.value;
    existingSalesCollections.push(promotionId);
    //check if promotionId exist in availablePromotions
    if (!availablePromotions.includes(promotionId)) {
      //delete collection
      await deleteCollection(client, saleCollection.id);
      messages.push(`Deleted orphaned collection: ${saleCollection.name}`);
    }
  }

  //5.
  for (let i = 0; i < availablePromotions.length; i++) {
    const currentPromotion = await client.query(
      GetPromotionByIdDocument,
      { id: availablePromotions[i] },
      { requestPolicy: "network-only" }
    );
    const promotionName = currentPromotion.data?.promotion?.name || "";
    const promotionRules = currentPromotion.data?.promotion?.rules || [];

    //get promotion's products
    const productIdsArray = await fetchPromotionsProducts(client, promotionRules);

    //get existing collection Id, with metadata related to current promotion
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "promotion", value: availablePromotions[i] }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    let promoCollectionId = saleCollectionsArr?.[0]?.id;
    //4. if no collection, create one
    if (!promoCollectionId) {
      promoCollectionId = await createCollection(client, promotionName, "", availablePromotions[i]);
      messages.push(`New collection has been created for: ${promotionName}`);
    }
    //update assigned products
    await updateProductsCollection(client, promoCollectionId, productIdsArray);

    //update name if diff
    if (saleCollectionsArr?.[0]?.name && saleCollectionsArr?.[0]?.name !== promotionName) {
      //update name of collection
      const { data: updatedCollection } = await client
        .mutation(UpdateCollectionDocument, {
          id: promoCollectionId,
          input: {
            name: promotionName,
            slug: titleToSlug(promotionName),
            seo: { title: promotionName },
          },
        })
        .toPromise();
    }
  }

  messages.push(`All sales collections have been synced`);
  return messages;
};

import { Client } from "urql";
import { fetchSales } from "../sales/get-sales";
import {
  CollectionFilterInput,
  GetSaleByIdDocument,
  Sale,
  UpdateCollectionDocument,
} from "../../../generated/graphql";
import { fetchSaleCollections } from "../collections/get-sale-collections";
import {
  createCollection,
  deleteCollection,
  updateProductsCollection,
} from "../collections/collection-crud";
import { fetchSalesProducts } from "../sales/get-sales-products";
import { titleToSlug } from "../../lib/to-slug";
import { publishCollection, unpublishCollection } from "../collections/collection-channels";
/**
 * 1. get all sales
 * 2. get all sales collections
 * 3. if any sales collection not in current sale, delete sales collection (orphan)
 * 4. if any sa;e, but no sales collection associated to it, create one
 * 5. sync the products added to sales collection
 */
export const sync = async (client: Client) => {
  let messages = [];
  //1.
  const availableSales = await fetchSales(client);
  //2.
  const collectionFilter: CollectionFilterInput = {
    metadata: [{ key: "isSale", value: "YES" }],
  };
  const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
  //3.
  const existingSalesCollections: any[] = [];
  for (const saleCollection of saleCollectionsArr) {
    const saleId = saleCollection.metadata.find(
      (item: { key: string }) => item.key === "sale"
    )?.value;
    existingSalesCollections.push(saleId);
    //check if saleId exist in availableSales
    if (!availableSales.includes(saleId)) {
      //delete collection
      await deleteCollection(client, saleCollection.id);
      messages.push(`Deleted orphaned collection: ${saleCollection.name}`);
    }
  }

  //5.
  for (let i = 0; i < availableSales.length; i++) {
    const currentSale = await client.query(
      GetSaleByIdDocument,
      { id: availableSales[i] },
      { requestPolicy: "network-only" }
    );
    const saleName = currentSale.data?.sale?.name || "";
    // const promotionRules = currentSale.data?.sale?.rules || [];
    const saleEndDate1 = currentSale.data?.sale?.endDate || "";
    const nowISO = new Date().toISOString();
    const nowDate = new Date(nowISO);
    const saleEndDate = new Date(saleEndDate1);
    const allChannels = currentSale.data?.sale?.channelListings || [];
    const uniqueChannels = allChannels.map((listing) => listing.channel.slug);

    //get sales products
    const productIdsArray = await fetchSalesProducts(client, currentSale.data?.sale as Sale);

    //get existing collection Id, with metadata related to current sale
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "sale", value: availableSales[i] }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    let saleCollectionId = saleCollectionsArr?.[0]?.id;
    //4. if no collection, create one
    if (!saleCollectionId) {
      saleCollectionId = await createCollection(
        client,
        saleName,
        availableSales[i],
        uniqueChannels
      );
      messages.push(`New collection has been created for: ${saleName}`);
    }

    if (saleEndDate1 != "" && saleEndDate < nowDate && uniqueChannels) {
      //remove collection from its channels if sale ended
      unpublishCollection(client, saleCollectionId, uniqueChannels);
    } else {
      publishCollection(client, saleCollectionId, uniqueChannels);
    }

    //update assigned products
    await updateProductsCollection(client, saleCollectionId, productIdsArray);

    //update name if diff
    if (saleCollectionsArr?.[0]?.name && saleCollectionsArr?.[0]?.name !== saleName) {
      //update name of collection
      const { data: updatedCollection } = await client
        .mutation(UpdateCollectionDocument, {
          id: saleCollectionId,
          input: {
            name: saleName,
            slug: titleToSlug(saleName),
            seo: { title: saleName },
          },
        })
        .toPromise();
    }
  }

  messages.push(`All sales collections have been synced`);
  return messages;
};

import { Client } from "urql";
import {
  AddProductsToCollectionDocument,
  AssignCollectionToChannelDocument,
  CreateNewCollectionDocument,
  DeleteCollectionDocument,
  ProductCollectionDocument,
  RemoveProductsFromCollectionDocument,
  UpdateCollectionDocument,
} from "../../../generated/graphql";
import { getChannelId } from "../sync/get-channel-id";
import { publishCollection } from "./collection-channels";

export async function deleteCollection(client: Client, collectionId: string) {
  const { data: deletedCollection } = await client
    .mutation(DeleteCollectionDocument, { id: collectionId })
    .toPromise();

  return deletedCollection?.collectionDelete?.errors;
}

export async function createCollection(
  client: Client,
  saleName: string,
  saleId: string,
  // promotionId: string,
  allChannels: any[]
) {
  try {
    // Create a new collection
    const { data: collectionData } = await client
      .mutation(CreateNewCollectionDocument, {
        input: {
          isPublished: true,
          name: saleName,
          seo: { title: saleName },
          metadata: [
            // { key: "promotion", value: promotionId },
            { key: "sale", value: saleId },
            { key: "isSale", value: "YES" },
          ],
        },
      })
      .toPromise();

    if (!collectionData || !collectionData.collectionCreate?.collection) {
      throw new Error("Failed to create collection");
    }
    const collectionId = collectionData.collectionCreate?.collection.id;
    await publishCollection(client, collectionId, allChannels);
    return collectionId;
  } catch (error) {
    console.error("Error handling sale deletion:", error);
    return error;
  }
}

export async function updateProductsCollection(
  client: Client,
  collectionId: string,
  saleProducts: string[]
) {
  const { data: existingCollectionProducts, error: resultProductsErr } = await client.query(
    ProductCollectionDocument,
    { filter: { collections: [collectionId] } },
    { requestPolicy: "network-only" }
  );

  const existingProductsInCollection = existingCollectionProducts?.products?.edges.map(
    (e: { node: any }) => e.node.id
  );
  // console.log('updateProductsCollection', existingCollectionProducts);

  if (!existingCollectionProducts && saleProducts) {
    // console.log("add", saleProducts);
    const { data: addProductsToCollection } = await client
      .mutation(AddProductsToCollectionDocument, {
        collectionId: collectionId,
        products: saleProducts,
      })
      .toPromise();
  } else {
    //check which products were removed, exists in existingProductsInCollection, not exists in  productIdsArray
    const notInNewUpdate =
      existingProductsInCollection &&
      existingProductsInCollection.filter((item) => !saleProducts.includes(item));
    if (notInNewUpdate && notInNewUpdate.length > 0) {
      //remove from collection
      const { data: removeProductsFromCollection } = await client
        .mutation(RemoveProductsFromCollectionDocument, {
          collectionId: collectionId,
          products: notInNewUpdate,
        })
        .toPromise();
    }

    //check which products were added, exists in productIdsArray, not exists in existingProductsInCollection
    const notInCollection =
      existingProductsInCollection &&
      saleProducts.filter((item) => !existingProductsInCollection.includes(item));
    if (notInCollection && notInCollection.length > 0) {
      //add to collection
      const { data: addProductsToCollection } = await client
        .mutation(AddProductsToCollectionDocument, {
          collectionId: collectionId,
          products: notInCollection,
        })
        .toPromise();
    }
  }
}

export async function updateSalesCollectionPrivateMetadata(
  client: Client,
  collectionId: string,
  privateMeta: any[]
) {
  const { data: updatedCollection } = await client
    .mutation(UpdateCollectionDocument, {
      id: collectionId,
      input: {
        privateMetadata: privateMeta,
      },
    })
    .toPromise();

  //console.log("updatedCollection", updatedCollection);
}

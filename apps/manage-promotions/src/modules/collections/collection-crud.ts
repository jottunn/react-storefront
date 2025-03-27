import { Client } from "urql";
import {
  AddProductsToCollectionDocument,
  CreateNewCollectionDocument,
  DeleteCollectionDocument,
  ProductCollectionDocument,
  RemoveProductsFromCollectionDocument,
  UpdateCollectionDocument,
} from "../../../generated/graphql";
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

    console.log("collectionDatacreate response", collectionData);
    if (!collectionData || !collectionData.collectionCreate?.collection) {
      throw new Error("Failed to create collection");
    }
    const collectionId = collectionData.collectionCreate?.collection.id;
    await publishCollection(client, collectionId, allChannels);
    return collectionId;
  } catch (error) {
    console.error("Error handling sale creation:", error);
    return error;
  }
}

export async function fetchProducts(client: Client, filter: any) {
  let hasNextPage = true;
  let afterCursor: string | null = null;
  const allProducts: any[] = [];
  while (hasNextPage) {
    const productsResponse: any = await client
      .query(
        ProductCollectionDocument,
        {
          filter: filter,
          first: 5,
          after: afterCursor,
        },
        { requestPolicy: "network-only" }
      )
      .toPromise();

    const productIds = productsResponse?.data?.products?.edges?.map(
      (e: { node: any }) => e.node.id
    );

    allProducts.push(...productIds);
    //console.log(' products?.pageInfo?.endCursor ', productsResponse?.data?.products?.pageInfo?.endCursor);
    hasNextPage = productsResponse?.data?.products?.pageInfo?.hasNextPage || false;
    afterCursor = productsResponse?.data?.products?.pageInfo?.endCursor ?? null;
  }

  return allProducts;
}

export async function updateProductsCollection(
  client: Client,
  collectionId: string,
  saleProducts: string[]
) {
  console.log("start updateProductsCollection");
  const existingProductsInCollection = await fetchProducts(client, { collections: [collectionId] });
  // console.log('updateProductsCollection', existingCollectionProducts);
  if (
    (!existingProductsInCollection ||
      (existingProductsInCollection && existingProductsInCollection.length == 0)) &&
    saleProducts
  ) {
    //console.log("add prods to collection", saleProducts);
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
      console.log("removeProductsFromCollection", removeProductsFromCollection);
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
  return updatedCollection;
  //console.log("updatedCollection", updatedCollection);
}

export async function addProductsToCollection(
  client: Client,
  collectionId: string,
  productsIds: any[]
) {
  const { data: addedProducts } = await client
    .mutation(AddProductsToCollectionDocument, {
      collectionId: collectionId,
      products: productsIds,
    })
    .toPromise();
  console.log("addedProducts", addedProducts);
  return addedProducts;
}

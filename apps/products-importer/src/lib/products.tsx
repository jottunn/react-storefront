import { Client } from "urql";

/**
 * Retrieves product details by productName
 *
 * @param client
 * @param productName
 * @returns
 */
export const getProductsVar = async (client: Client, productName: any) => {
  console.log(productName);
  const productQuery = `
    query GetProductByName($title: String!) {
      products(where: { name: {eq : $title } }, first: 4, channel: "default-channel") {
        edges {
          node {
            id
            name
            variants{
              id
              attributes {
                attribute {
                  id
                  name              
                }
                values {
                    id
                    name
                  }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const result = await client.query(
      productQuery,
      { title: productName },
      { requestPolicy: "network-only" }
    );
    const node = result.data.products?.edges.map((e: { node: any }) => e.node);
    return node[0]; // Return the first node
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

/**
 *
 * @param client
 * @param sku
 * @returns
 */

export const getProductVariantBySku = async (client: Client, sku: any) => {
  const productVariantQuery = `
  query GetProductVariantBySku($sku: String!) {
    productVariant(sku: $sku) {
      id,
      product {
        id
      }
    }
  }
  `;

  try {
    const result = await client.query(productVariantQuery, { sku: sku });
    return result.data.productVariant?.product?.id;
  } catch (error) {
    console.error("Error fetching product variants:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

/**
 *
 * @param client
 * @param categoryNames
 * @returns
 */
export const getCategoryID = async (client: Client, categoryNames: []) => {
  console.log("getCategoryID", categoryNames);
  const getCategoriesQuery = `
  query GetCategoryID($categoryNames: [String!]!) {
    categories(first: 100, filter: { slugs:  $categoryNames }) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
  `;

  try {
    const result = await client.query(getCategoriesQuery, { categoryNames: categoryNames });
    //console.log(result);
    const node = result.data.categories?.edges.map((e: { node: any }) => e.node);
    if (node && node.length > 0) {
      return node[0]["id"]; // Return the first node
    }
    return false;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

export const getProductTypeAttributes = async (client: Client, productTypeSlug: []) => {
  const getProdTypeAttrs = `
  query productTypeAttributes($slug: [String!]!) {
    productTypes(first: 1, filter: { slugs:  $slug }) {
      edges {
        node {
          id
           productAttributes {
            id
            inputType
            slug
            name            
            }
          assignedVariantAttributes {
            attribute {
              id
              inputType
              slug
              name
            }
          }
      	}
     }
    }
  }`;
  try {
    const result = await client.query(getProdTypeAttrs, { slug: productTypeSlug });
    return result.data.productTypes?.edges[0].node;
  } catch (error) {
    console.error("Error fetching product type:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

export const getCollections = async (
  client: Client,
  collectionName: String,
  createCollectionMutation: any,
  assignCollectionToChannelMutation: any,
  channelId: string
) => {
  const getCollection = `
  query getCollectionBySlug($search: String) {
    collections(first: 1, filter: { search:  $search}) {
      edges {
        node {
          id
        name
        slug
        }
      }
    }
  }  
  `;
  try {
    const result = await client.query(getCollection, { search: collectionName });
    const node = result.data.collections?.edges.map((e: { node: any }) => e.node);
    if (node[0]) {
      return node[0]["id"];
    } else {
      return await createNewCollection(
        createCollectionMutation,
        collectionName,
        assignCollectionToChannelMutation,
        channelId
      );
    }
  } catch (error) {
    console.error("Error fetching collection details:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

export const createNewCollection = async (
  createCollectionMutation: any,
  collectionName: String,
  assignCollectionToChannelMutation: any,
  channelId: string
) => {
  try {
    const result = await createCollectionMutation({
      input: {
        isPublished: true,
        name: collectionName,
      },
    });

    if (result.error === undefined && result.data) {
      const collectionId = result.data.collectionCreate.collection.id;
      //assign the new collection to channel
      const result2 = await assignCollectionToChannelMutation({
        id: collectionId,
        input: {
          addChannels: [
            {
              channelId: channelId,
              isPublished: true,
            },
          ],
        },
      });
      // console.log('create collection', result2);
      return collectionId;
    }

    return false;
  } catch (error) {
    // Handle errors
    console.error(error);
  }
};

/**
 *
 * @param client
 * @param categoryNames
 * @returns
 */
export const getChannels = async (client: Client) => {
  const getChannelsQuery = `
  query GetChannels {
    channels {     
      id
      slug        
    }
  }
  `;
  try {
    const result = await client.query(getChannelsQuery, {});
    return result.data.channels;
  } catch (error) {
    console.error("Error fetching channel:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

export const getPage = async (client: Client, pageSlug: String) => {
  const getPage = `
  query getPage($slug: String!) {
    page(slug: $slug) {
      id
    }
  }  
  `;
  try {
    const result = await client.query(getPage, { slug: pageSlug });
    return result.data.page?.id;
  } catch (error) {
    console.error("Error fetching page details:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

export const getDefaultWarehouse = async (client: Client) => {
  const getDefaultWarehouse = `
  query getDefaultWarehouse($filter: WarehouseFilterInput) {
    warehouses(filter: $filter, first:1) {   
      edges {
        node {
          id
        }
      }
    }   
  }
  `;
  try {
    const result = await client.query(getDefaultWarehouse, { filter: { slugs: ["default"] } });
    //console.log(result);
    return result.data.warehouses.edges[0].node.id;
  } catch (error) {
    console.error("Error fetching page details:", error);
    throw error; // Throw the error for handling in the calling function
  }
};

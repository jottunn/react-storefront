import { Client } from "urql";
import { CategoriesAllDocument, CollectionsAllDocument } from "../../../generated/graphql";

export async function fetchCollections(client: Client) {
  try {
    const { data: collections } = await client.query(
      CollectionsAllDocument,
      { channel: "default-channel" },
      { requestPolicy: "network-only" }
    );

    return collections?.collections?.edges.map((e: { node: any }) => e.node) || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw error; // Throw the error for handling in the calling function
  }
}

export async function fetchCategories(client: Client) {
  try {
    const { data: categories } = await client.query(
      CategoriesAllDocument,
      {},
      { requestPolicy: "network-only" }
    );
    return categories?.categories?.edges.map((e: { node: any }) => e.node) || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Throw the error for handling in the calling function
  }
}

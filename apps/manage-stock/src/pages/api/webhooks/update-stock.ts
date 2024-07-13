import { createClient } from "../../../lib/create-graphq-client";
import { saleorApp } from "../../../saleor-app";
const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY;

export default async (
  req: { body: { sku: string; quantity: number }; headers: { authorization: string } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error?: string; message?: string }): any; new (): any };
    };
  }
) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${WEBHOOK_SECRET_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Assuming the body parser is enabled for this route, if you're receiving JSON:
  const { sku, quantity } = req.body;
  const authData = await saleorApp.apl.getAll();

  if (!authData || !authData[0] || !authData[0]["saleorApiUrl"] || !authData[0]["token"]) {
    console.error("Authentication data is missing or incomplete:", authData);
    return res.status(500).json({ error: "Failed to retrieve valid authentication data" });
  }

  if (!sku || quantity === undefined || quantity === null) {
    return res.status(400).json({ error: "stock information missing" });
  }

  if (quantity < 0) {
    return res.status(500).json({ error: "Quantity can't be negative" });
  }

  const client = createClient(authData[0]["saleorApiUrl"], async () => ({
    token: authData[0]["token"],
  }));

  let warehouseId = "";

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
    warehouseId = result.data.warehouses.edges[0].node.id;
  } catch (error) {
    console.error("Error fetching page details:", error);
    throw error;
  }

  try {
    // Mutation to update the stock of the product variant
    const mutation = `
      mutation UpdateProductVariantStocks($sku: String!, $stocksInput: [StockInput!]!) {
        productVariantStocksUpdate(sku: $sku, stocks: $stocksInput) {
          errors {
            message
          }
        }
      }
    `;

    // Perform the mutation with the provided SKU and stocks data
    const stocksInput = [{ warehouse: warehouseId, quantity: quantity }];
    const result = await client.mutation(mutation, { sku, stocksInput }).toPromise();

    // Handle potential errors in the mutation result
    if (result.error || result.data.productVariantStocksUpdate.errors.length > 0) {
      console.error(
        "Error updating stock:",
        result.error || result.data.productVariantStocksUpdate.errors
      );
      return res
        .status(500)
        .json({
          error: "Failed to update stock in Saleor. Please check that correct info is provided.",
        });
    }
  } catch (error) {
    console.error("Error handling stock update:", error);
    return res.status(500).json({ error: "Internal server error - Error handling stock update" });
  }

  return res.status(200).json({ message: "Stock updated successfully" });
};

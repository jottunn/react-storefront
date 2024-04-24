import { createClient } from "../../../lib/create-graphq-client";
import { saleorApp } from "../../../saleor-app";

export default async (
  req: { body: { sku: any; stocks: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error?: string; message?: string }): any; new (): any };
    };
  }
) => {
  // Assuming the body parser is enabled for this route, if you're receiving JSON:
  const { sku, stocks } = req.body;
  const authData = await saleorApp.apl.getAll();

  if (!authData || !authData[0] || !authData[0]["saleorApiUrl"] || !authData[0]["token"]) {
    console.error("Authentication data is missing or incomplete:", authData);
    return res.status(500).json({ error: "Failed to retrieve valid authentication data" });
  }

  const client = createClient(authData[0]["saleorApiUrl"], async () => ({
    token: authData[0]["token"],
  }));

  if (!sku || !stocks) {
    return res.status(400).json({ error: "SKU or stocks information missing" });
  }

  try {
    // Mutation to update the stock of the product variant
    const mutation = `
      mutation UpdateProductVariantStocks($sku: String!, $stocks: [StockInput!]!) {
        productVariantStocksUpdate(sku: $sku, stocks: $stocks) {
          errors {
            message
          }
        }
      }
    `;

    // Perform the mutation with the provided SKU and stocks data
    const result = await client.mutation(mutation, { sku, stocks }).toPromise();

    // Handle potential errors in the mutation result
    if (result.error || result.data.productVariantStocksUpdate.errors.length > 0) {
      console.error(
        "Error updating stock:",
        result.error || result.data.productVariantStocksUpdate.errors
      );
      return res.status(500).json({ error: "Failed to update stock in Saleor" });
    }

    // Respond to indicate success
    return res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error handling stock update:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Since you're directly receiving and processing data, bodyParser doesn't need to be disabled,
 * unless you have a specific reason to handle raw streams for signature verification or similar.
 */

//curl -X POST https://4b79-82-76-36-249.ngrok-free.app/api/webhooks/update-stock -H "Content-Type: application/json" -d '{"sku": "4566","stocks" : [{"warehouse": "V2FyZWhvdXNlOjc2Y2I5NjZkLWE1YzAtNDFlYS1hZjk0LWFkZmZkYTg5NTEzNA==","quantity": 2}]}'

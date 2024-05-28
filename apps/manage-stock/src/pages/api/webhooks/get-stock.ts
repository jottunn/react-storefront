import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";
import { saleorApp } from "../../../saleor-app";
import { WebhookError } from "../../../../generated/graphql";
import { createClient } from "../../../lib/create-graphq-client";

type ProductVariantPayload = {
  productVariant: {
    sku: string;
  };
};

/**
 * Default body parser must be turned off - the raw body is needed to verify the signature
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

export const getStockWebhook = new SaleorAsyncWebhook<ProductVariantPayload>({
  name: "GetStock",
  webhookPath: "api/webhooks/get-stock",
  event: "PRODUCT_VARIANT_CREATED",
  isActive: true,
  apl: saleorApp.apl,
  query: `subscription {
      event {
        ... on ProductVariantCreated {
          __typename
          productVariant(channel: "default-channel") {
            sku
          }
        }
      }
    }`,
  onError(error: WebhookError | Error) {
    //sentry.captureError(error);
  },
  async formatErrorResponse(
    error: WebhookError | Error,
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    return {
      code: 400,
      body: "My custom response",
    };
  },
});

async function fetchStockQuantityFromExternalService(sku: string) {
  // TODO - for when in PROD
  // Use fetch or any HTTP client to call the external service
  // This is a placeholder: replace with your actual call to the external service
  // const response = await fetch('https://external-service.com/api/get-stock', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ sku }),
  // });

  // const data = await response.json();
  // return data.quantity; // Adjust based on the actual response structure
  return 1;
}

/**
 * Handler has to be a default export so the Next.js will be able to use it
 */
export default getStockWebhook.createHandler(async (req, res, context) => {
  const { baseUrl, event, payload, authData } = context;
  console.log(payload);
  const sku = payload.productVariant.sku;

  if (!sku) {
    return res.status(400).json({ error: "SKU not provided" });
  }

  try {
    // Call the external service to get the stock quantity
    const quantity = await fetchStockQuantityFromExternalService(sku);

    if (quantity) {
      // Create a GraphQL client
      if (!authData.saleorApiUrl || !authData.token) {
        console.error("Authentication data is missing or incomplete:", authData);
        return res.status(500).json({ error: "Failed to retrieve valid authentication data" });
      }
      const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

      //Update the stock of the variant in Saleor
      const mutation = `
      mutation UpdateProductVariantStocks($sku: String!, $stocks: [StockInput!]!) {
        productVariantStocksUpdate(sku: $sku, stocks: $stocks) {
          errors {
            message
          }
        }
      }
    `;

      const variables = {
        sku,
        stocks: [{ warehouse: process.env.APP_DEFAULT_WAREHOUSE, quantity }],
      };

      const result = await client.mutation(mutation, variables).toPromise();

      console.log(variables);

      if (result.error) {
        console.error("Error updating stock:", result.error);
        return res.status(500).json({ error: "Failed to update stock in Saleor" });
      }

      // Successfully updated stock
      return res.status(200).json({ message: "Stock updated successfully" });
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  // End with status 200
  return res.status(200).end();
});

import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";
import { saleorApp } from "../../../saleor-app";
import { WebhookError } from "../../../../generated/graphql";
import { createClient } from "../../../lib/create-graphq-client";
import { handleStockUpdate } from "../../../modules/handle-sync-stock-update";

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

/**
 * Handler has to be a default export so the Next.js will be able to use it
 */
export default getStockWebhook.createHandler(async (req, res, context) => {
  const { baseUrl, event, payload, authData } = context;
  console.log(payload);
  const sku = payload.productVariant.sku;
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  if (!sku) {
    return res.status(400).json({ error: "SKU not provided" });
  }

  try {
    //call existing function to get the stoick for newly added variant
    const stockUpdate = await handleStockUpdate(client, sku);
    console.log("stockUpdate", stockUpdate);
    return res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

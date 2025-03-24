import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import logger from "../../../logger";
import Bull from "bull";
import { handleStockUpdated } from "../../../modules/handle-stock-updated";
import { NextApiRequest, NextApiResponse } from "next";

type ProductVariantStockUpdatedWebhookPayloadFragment = {
  productVariant: {
    sku: string;
    stocks: any[];
    product: any;
  };
};

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const ProductVariantStockUpdatedGraphqlSubscription = gql`
  fragment ProductVariantStockUpdatedWebhookPayload on ProductVariantStockUpdated {
    productVariant {
      id
      sku
      stocks {
        id
        quantity
      }
      product {
        id
        variants {
          stocks {
            id
            quantity
          }
        }
        channelListings {
          channel {
            id
          }
        }
      }
    }
  }

  subscription ProductVariantStockUpdated {
    event {
      ...ProductVariantStockUpdatedWebhookPayload
    }
  }
`;
/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * SaleCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const productVariantStockUpdatedWebhook =
  new SaleorAsyncWebhook<ProductVariantStockUpdatedWebhookPayloadFragment>({
    name: "Stock Updated in Saleor",
    webhookPath: "api/webhooks/stock-updated",
    event: "PRODUCT_VARIANT_STOCK_UPDATED",
    apl: saleorApp.apl,
    query: ProductVariantStockUpdatedGraphqlSubscription,
  });

/**
 * Export decorated Next.js handler, which adds extra context
 */
let client: any;

export default productVariantStockUpdatedWebhook.createHandler(async (req, res, ctx) => {
  const {
    /**
     * Access payload from Saleor - defined above
     */
    payload,
    /**
     * Saleor event that triggers the webhook (here - ORDER_CREATED)
     */
    event,
    /**
     * App's URL
     */
    baseUrl,
    /**
     * Auth data (from APL) - contains token and saleorApiUrl that can be used to construct graphQL client
     */
    authData,
  } = ctx;

  /**
   * Perform logic based on Saleor Event payload
   */
  // console.log('payload', payload)
  if (!payload.productVariant) {
    console.log("Product Variant data is missing from the payload");
    return res.status(200).send("No action needed, product variant data is missing.");
  }

  /**
   * Create GraphQL client to interact with Saleor API.
   */
  if (!client) {
    client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));
  }
  //schedule a job to handle stock changes
  const stockUpdatedQueue = new Bull("stockUpdatedQueue", {
    redis: {
      host: process.env.REDIS_HOST || "redis",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    },
  });

  stockUpdatedQueue.process(async (job) => {
    //console.log("Processing job:", job.id, "with payload:", JSON.stringify(job.data.payload));
    try {
      const authData = await saleorApp.apl.getAll();
      const { payload } = job.data;
      const client = createClient(authData[0]["saleorApiUrl"], async () => ({
        token: authData[0]["token"],
      }));
      await handleStockUpdated(client, payload);
      logger.info(`handleStockUpdated job done for ${job.data.payload?.productVariant?.sku}`);
      return { status: "success" };
    } catch (error) {
      logger.error(`Job failed with error: ${error.message}`);
      throw error; // Ensure the error is thrown so Bull can handle it
    }
  });

  stockUpdatedQueue.on("failed", (job, err) => {
    console.error(`Job failed with error: ${err.message}`);
  });

  // Schedule stock updated job to run after 1 minute
  await stockUpdatedQueue.add({ payload }, { delay: 60000, removeOnComplete: true });
  /**
   * Inform Saleor that webhook was delivered properly.
   */
  return res.status(200).end();
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

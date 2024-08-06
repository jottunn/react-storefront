import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import logger from "../../../logger";

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
  if (!payload.productVariant) {
    console.log("Product Variant data is missing from the payload");
    return res.status(200).send("No action needed, product variant data is missing.");
  }
  const productVariantSku = payload.productVariant?.sku;
  const hasStock = payload.productVariant.stocks.some((stock) => stock.quantity > 0);
  const availableQuantity = payload.productVariant.stocks.reduce((max, stock) => {
    return stock.quantity > 0 && stock.quantity > max ? stock.quantity : max;
  }, 0);

  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  /**
   * Now you can fetch additional data using urql.
   * https://formidable.com/open-source/urql/docs/api/core/#clientquery
   */
  //const data = await client.query().toPromise()

  const updateProductVariantTrackInventoryMutation = `
        mutation UpdateProductVariantTrackInventory($sku: String!, $input: ProductVariantInput!) {
          productVariantUpdate(sku: $sku, input: $input) {
            errors {
              message
            }
          }
        }
      `;

  try {
    const resultTrackInventory = await client
      .mutation(updateProductVariantTrackInventoryMutation, {
        sku: productVariantSku,
        input: {
          sku: productVariantSku,
          trackInventory: hasStock ? false : true,
          quantityLimitPerCustomer: availableQuantity > 0 ? availableQuantity : null,
        },
      })
      .toPromise();
    if (
      resultTrackInventory.error ||
      resultTrackInventory.data.productVariantUpdate.errors.length > 0
    ) {
      console.error(
        "Error updating variant stock info (trackInventory, quantityLimitPerCustomer)",
        resultTrackInventory.error || resultTrackInventory.data.productVariantUpdate.errors
      );
      logger.error(
        `Error updating variant stock info (trackInventory, quantityLimitPerCustomer). Error: ${JSON.stringify(
          resultTrackInventory.error || resultTrackInventory.data.productVariantUpdate.errors
        )}`
      );
      return res.status(500).json({ error: "Failed to update variant stock info" });
    }
  } catch (error) {
    console.error("Error updating variant's Track Inventory:");
    logger.error(`Error fetching warehouse details. Error: ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ error: "Internal server error - Error updating variant stock info" });
  }

  //if product is out of stock, all variants have stock 0, then mark it as unav for purchase + hiding from listings
  // Check if all variants have stock 0
  const allVariantsOutOfStock = payload.productVariant.product.variants.every(
    (variant: { stocks: any[] }) => variant.stocks.every((stock) => stock.quantity === 0)
  );
  const updateProductChannelListingMutation = gql`
    mutation UpdateProductChannelListing($id: ID!, $input: ProductChannelListingUpdateInput!) {
      productChannelListingUpdate(id: $id, input: $input) {
        errors {
          message
        }
      }
    }
  `;

  try {
    const updateChannels = payload.productVariant.product.channelListings.map(
      (listing: { channel: { id: any } }) => ({
        channelId: listing.channel.id,
        isAvailableForPurchase: !allVariantsOutOfStock,
        visibleInListings: !allVariantsOutOfStock,
      })
    );

    const resultUpdateProductChannel = await client
      .mutation(updateProductChannelListingMutation, {
        id: payload.productVariant.product.id,
        input: { updateChannels },
      })
      .toPromise();

    if (
      resultUpdateProductChannel.error ||
      resultUpdateProductChannel.data.productChannelListingUpdate.errors.length > 0
    ) {
      console.error(
        "Error updating product channel listing",
        resultUpdateProductChannel.error ||
          resultUpdateProductChannel.data.productChannelListingUpdate.errors
      );
      logger.error(
        `Error updating product channel listing. Error: ${JSON.stringify(
          resultUpdateProductChannel.error ||
            resultUpdateProductChannel.data.productChannelListingUpdate.errors
        )}`
      );
      return res.status(500).json({ error: "Failed to update product channel listing" });
    }
  } catch (error) {
    console.error("Error updating product channel listing:");
    logger.error(`Error updating product channel listing. Error: ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ error: "Internal server error - Error updating product channel listing" });
  }

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

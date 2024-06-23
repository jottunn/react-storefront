import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { ProductCreated } from "../../../../../generated/graphql";
import { createLogger } from "../../../../lib/logger";
import { webhookProductCreated } from "../../../../webhooks/definitions/product-created";
import { createWebhookContext } from "../../../../webhooks/webhook-context";
import { withOtel } from "@saleor/apps-otel";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../../../lib/logger-context";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductCreatedWebhookHandler");

export const handler: NextWebhookApiHandler<ProductCreated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.info(`New event received: ${event} (${context.payload?.__typename})`, {
    saleorApiUrl: authData.saleorApiUrl,
  });

  const { product } = context.payload;

  if (!product) {
    logger.error("Webhook did not received expected product data in the payload.");
    return res.status(200).end();
  }

  try {
    const { algoliaClient, apiClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.createProduct(product);

      logger.info("Algolia createProduct success");

      res.status(200).end();
      return;
    } catch (e) {
      logger.error("Failed to execute product_created webhook", { error: e });

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    logger.error("Failed to execute product_created webhook", { error: e });

    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default wrapWithLoggerContext(
  withOtel(webhookProductCreated.createHandler(handler), "api/webhooks/saleor/product_created"),
  loggerContext,
);

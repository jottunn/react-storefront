import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookSaleFragmentDoc,
  SaleCreatedWebhookPayloadFragment,
  SaleCreatedWebhookPayloadFragmentDoc,
  GetPromotionByNameDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import { createCollection } from "../../../modules/collections/collection-crud";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: PromotionCreatedWebhookPayloadFragment
 */
gql`
  ${WebhookSaleFragmentDoc}
  fragment SaleCreatedWebhookPayload on SaleCreated {
    sale {
      ...WebhookSale
    }
  }
`;

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const SaleCreatedGraphqlSubscription = gql`
  # Payload fragment must be included in the root query
  ${SaleCreatedWebhookPayloadFragmentDoc}
  subscription SaleCreated {
    event {
      ...SaleCreatedWebhookPayload
    }
  }
`;
/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * PromotionCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const promotionCreatedWebhook = new SaleorAsyncWebhook<SaleCreatedWebhookPayloadFragment>({
  name: "Promotion Created in Saleor",
  webhookPath: "api/webhooks/promotion-created",
  event: "SALE_CREATED",
  apl: saleorApp.apl,
  query: SaleCreatedGraphqlSubscription,
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default promotionCreatedWebhook.createHandler(async (req, res, ctx) => {
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
  console.log(`Promotion was created: ${payload.sale?.id}`);
  const saleId = payload.sale?.id || "";
  const saleName = payload.sale?.name;
  if (!saleName) {
    console.log("Sale data is missing from the payload");
    return res.status(200).send("No action needed, sale data is missing.");
  }
  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  /**
   * Now you can fetch additional data using urql.
   * https://formidable.com/open-source/urql/docs/api/core/#clientquery
   */
  //const data = await client.query().toPromise()
  try {
    const newPromototionResult = await client.query(
      GetPromotionByNameDocument,
      { where: { name: { eq: saleName } } },
      { requestPolicy: "network-only" }
    );
    const promotionId = newPromototionResult.data?.promotions?.edges?.[0].node?.id;
    const promotionRules = newPromototionResult.data?.promotions?.edges?.[0].node?.rules || [];
    const allChannels = promotionRules.flatMap((rule) => rule.channels);
    const uniqueChannels = allChannels.filter(
      (channel, index, self) => index === self.findIndex((c) => c?.slug === channel?.slug)
    );

    if (!promotionId) {
      console.log("No promotion found with the given name:", saleName);
      return res.status(404).send("Promotion not found");
    }

    await createCollection(client, saleName, saleId, promotionId, uniqueChannels);

    // console.log('channelAssignedData', channelAssignedData);
  } catch (error) {
    console.error("Error creating collection for promotion:", error);
    throw error; // Throw the error for handling in the calling function
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

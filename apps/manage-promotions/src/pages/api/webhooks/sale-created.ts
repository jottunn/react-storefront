import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookSaleFragmentDoc,
  SaleCreatedWebhookPayloadFragment,
  SaleCreatedWebhookPayloadFragmentDoc,
  GetSaleByNameDocument,
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
 * SaleCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const saleCreatedWebhook = new SaleorAsyncWebhook<SaleCreatedWebhookPayloadFragment>({
  name: "Sale Created in Saleor",
  webhookPath: "api/webhooks/sale-created",
  event: "SALE_CREATED",
  apl: saleorApp.apl,
  query: SaleCreatedGraphqlSubscription,
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default saleCreatedWebhook.createHandler(async (req, res, ctx) => {
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
  console.log(`Sale was created: ${payload.sale?.id}`);
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
    const newSaleResult = await client.query(
      GetSaleByNameDocument,
      { filter: { search: saleName } },
      { requestPolicy: "network-only" }
    );
    const currentSaleEdge = newSaleResult.data?.sales?.edges.find(
      (edge) => edge.node.name === saleName
    );
    const currentSale = currentSaleEdge ? currentSaleEdge.node : undefined;
    console.log("currentSale", currentSale);
    const saleId = currentSale?.id;
    const allChannels = currentSale?.channelListings || [];
    const uniqueChannels = allChannels.map((listing) => listing.channel.slug);
    console.log("uniqueChannels", uniqueChannels);

    if (!saleId) {
      console.log("No sale found with the given name:", saleName);
      return res.status(404).send("Sale not found");
    }

    await createCollection(client, saleName, saleId, uniqueChannels);

    // console.log('channelAssignedData', channelAssignedData);
  } catch (error) {
    console.error("Error creating collection for sale:", error);
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

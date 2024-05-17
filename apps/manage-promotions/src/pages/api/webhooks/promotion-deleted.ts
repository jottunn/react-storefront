import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookSaleFragmentDoc,
  SaleDeletedWebhookPayloadFragment,
  SaleDeletedWebhookPayloadFragmentDoc,
  GetPromotionByNameDocument,
  CollectionFilterInput,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import { fetchPromotions } from "../../../modules/promotions/get-promotions";
import { fetchSaleCollections } from "../../../modules/collections/get-sale-collections";
import { deleteCollection } from "../../../modules/collections/collection-crud";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: PromotionDeletedWebhookPayloadFragment
 */
gql`
  ${WebhookSaleFragmentDoc}
  fragment SaleDeletedWebhookPayload on SaleDeleted {
    sale {
      ...WebhookSale
    }
  }
`;

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const SaleDeletedGraphqlSubscription = gql`
  # Payload fragment must be included in the root query
  ${SaleDeletedWebhookPayloadFragmentDoc}
  subscription SaleDeleted {
    event {
      ...SaleDeletedWebhookPayload
    }
  }
`;
/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * PromotionDeletedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const promotionDeletedWebhook = new SaleorAsyncWebhook<SaleDeletedWebhookPayloadFragment>({
  name: "Promotion Deleted in Saleor",
  webhookPath: "api/webhooks/promotion-deleted",
  event: "SALE_DELETED",
  apl: saleorApp.apl,
  query: SaleDeletedGraphqlSubscription,
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default promotionDeletedWebhook.createHandler(async (req, res, ctx) => {
  const {
    /**
     * Access payload from Saleor - defined above
     */
    payload,
    /**
     * Saleor event that triggers the webhook
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
  console.log(`Promotion was deleted: ${payload.sale?.id}`);
  const saleName = payload.sale?.name;
  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  if (!saleName) {
    console.error("Sale name is missing in the payload, loading workaround");
    //workaround: get all promotions and get all sales collections - for each sale promotion check if promotion field has value in available promotions

    const availablePromotions = await fetchPromotions(client);
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "isSale", value: "YES" }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);

    for (const saleCollection of saleCollectionsArr) {
      const promotionId = saleCollection.metadata.find(
        (item: { key: string }) => item.key === "promotion"
      )?.value;
      //check if promotionId exist in availablePromotions
      if (!availablePromotions.includes(promotionId)) {
        //delete collection
        await deleteCollection(client, saleCollection.id);
      }
    }

    return res.status(200).end();
  }

  try {
    const newPromotionResult = await client.query(
      GetPromotionByNameDocument,
      { where: { name: { eq: saleName } } },
      { requestPolicy: "network-only" }
    );
    const promotionId = newPromotionResult.data?.promotions?.edges?.[0].node?.id;
    if (!promotionId) {
      //console.log('No promotion found with the given name:', saleName);
      return res.status(404).send("Promotion not found");
    }
    //get existing collection Id, with metadata related to updated promotion
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "promotion", value: promotionId }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    const promoCollectionId = saleCollectionsArr?.[0].id;

    if (!promoCollectionId) {
      //console.log('No collection found for the promotion:', promotionId);
      return res.status(404).send("Collection not found");
    }
    // Delete existing collection
    await deleteCollection(client, promoCollectionId);
  } catch (error) {
    console.error("Error handling promotion deletion:", error);
    return res.status(500).send("Internal Server Error");
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

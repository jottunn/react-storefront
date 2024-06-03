import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookSaleFragmentDoc,
  SaleDeletedWebhookPayloadFragment,
  SaleDeletedWebhookPayloadFragmentDoc,
  CollectionFilterInput,
  GetSaleByNameDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import { fetchSales } from "../../../modules/sales/get-sales";
import { fetchSaleCollections } from "../../../modules/collections/get-sale-collections";
import { deleteCollection } from "../../../modules/collections/collection-crud";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: SaleDeletedWebhookPayloadFragment
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
 * SaleDeletedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const saleDeletedWebhook = new SaleorAsyncWebhook<SaleDeletedWebhookPayloadFragment>({
  name: "Sale Deleted in Saleor",
  webhookPath: "api/webhooks/sale-deleted",
  event: "SALE_DELETED",
  apl: saleorApp.apl,
  query: SaleDeletedGraphqlSubscription,
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default saleDeletedWebhook.createHandler(async (req, res, ctx) => {
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
  console.log(`Sale was deleted: ${payload.sale?.id}`);
  const saleName = payload.sale?.name;
  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  if (!saleName) {
    console.error("Sale name is missing in the payload, loading workaround");
    //workaround: get all sales and get all sales collections - for each sale collection check if sale field has value in available sales

    const availableSales = await fetchSales(client);
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "isSale", value: "YES" }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);

    for (const saleCollection of saleCollectionsArr) {
      const saleId = saleCollection.metadata.find(
        (item: { key: string }) => item.key === "sale"
      )?.value;
      //check if saleId exist in availableSales
      if (!availableSales.includes(saleId)) {
        //delete collection
        await deleteCollection(client, saleCollection.id);
      }
    }

    return res.status(200).end();
  }

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
    const saleId = currentSale?.id;
    if (!saleId) {
      //console.log('No sale found with the given name:', saleName);
      return res.status(404).send("Sale not found");
    }
    //get existing collection Id, with metadata related to updated sale
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "sale", value: saleId }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    const saleCollectionId = saleCollectionsArr?.[0].id;

    if (!saleCollectionId) {
      //console.log('No collection found for the sale:', saleId);
      return res.status(404).send("Collection not found");
    }
    // Delete existing collection
    await deleteCollection(client, saleCollectionId);
  } catch (error) {
    console.error("Error handling sale deletion:", error);
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

import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookSaleFragmentDoc,
  SaleUpdatedWebhookPayloadFragment,
  SaleUpdatedWebhookPayloadFragmentDoc,
  GetPromotionByNameDocument,
  CollectionFilterInput,
  UpdateCollectionDocument,
  UpdateCollectionChannelDocument,
  GetSaleByNameDocument,
  Sale,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import { titleToSlug } from "../../../lib/to-slug";
import { fetchSaleCollections } from "../../../modules/collections/get-sale-collections";
import {
  createCollection,
  updateProductsCollection,
} from "../../../modules/collections/collection-crud";
import { fetchSalesProducts } from "../../../modules/sales/get-sales-products";
import { getChannelId } from "../../../modules/sync/get-channel-id";
import {
  publishCollection,
  unpublishCollection,
} from "../../../modules/collections/collection-channels";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: SaleCreatedWebhookPayloadFragment
 */
gql`
  ${WebhookSaleFragmentDoc}
  fragment SaleUpdatedWebhookPayload on SaleUpdated {
    sale {
      ...WebhookSale
    }
  }
`;

/**
 * Top-level webhook subscription query, that will be attached to the Manifest.
 * Saleor will use it to register webhook.
 */
const SaleUpdatedGraphqlSubscription = gql`
  # Payload fragment must be included in the root query
  ${SaleUpdatedWebhookPayloadFragmentDoc}
  subscription SaleUpdated {
    event {
      ...SaleUpdatedWebhookPayload
    }
  }
`;

/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * SaleCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const saleUpdatedWebhook = new SaleorAsyncWebhook<SaleUpdatedWebhookPayloadFragment>({
  name: "Sale Updated in Saleor",
  webhookPath: "api/webhooks/sale-updated",
  event: "SALE_UPDATED",
  apl: saleorApp.apl,
  query: SaleUpdatedGraphqlSubscription,
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default saleUpdatedWebhook.createHandler(async (req, res, ctx) => {
  const {
    /**
     * Access payload from Saleor - defined above
     */
    payload,
    /**
     * Saleor event that triggers the webhook (here - SALE_UPDATED)
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
  console.log(`Sale was updated: ${payload.sale?.id}`);
  if (!payload.sale) {
    console.log("Sale data is missing from the payload");
    return res.status(200).send("No action needed, sale data is missing.");
  }

  const saleId = payload.sale?.id;
  const saleName = payload.sale?.name;
  //console.log(saleId);
  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  /**
   * Now you can fetch additional data using urql.
   * https://formidable.com/open-source/urql/docs/api/core/#clientquery
   */

  try {
    const result = await client.query(
      GetSaleByNameDocument,
      { filter: { search: saleName } },
      { requestPolicy: "network-only" }
    );
    // console.log(result);
    const currentSaleEdge = result.data?.sales?.edges.find((edge) => edge.node.name === saleName);
    const currentSale = currentSaleEdge ? currentSaleEdge.node : undefined;
    const saleId = currentSale?.id || "";
    const saleEndDate1 = currentSale?.endDate || "";
    const nowISO = new Date().toISOString();
    const nowDate = new Date(nowISO);
    const saleEndDate = new Date(saleEndDate1);
    const allChannels = currentSale?.channelListings || [];
    const uniqueChannels = allChannels.map(
      (listing: { channel: { slug: any } }) => listing.channel.slug
    );
    //get existing collection Id, with metadata related to updated promotion
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "sale", value: saleId }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    let saleCollectionId = saleCollectionsArr?.[0]?.id;
    // console.log(saleCollectionId);

    if (!saleCollectionId && saleEndDate1 != "" && saleEndDate < nowDate) {
      //collection already unpublished, do nothing
      return res.status(200).end();
    }

    if (!saleCollectionId) {
      console.log("No Collection found associated with sale:", saleName);
      //return res.status(404).send('Collection not found');
      //create new collection
      saleCollectionId = await createCollection(client, saleName, saleId, uniqueChannels);
    }

    if (saleEndDate1 != "" && saleEndDate < nowDate && uniqueChannels) {
      //remove collection from its channels
      unpublishCollection(client, saleCollectionId, uniqueChannels);
    } else {
      publishCollection(client, saleCollectionId, uniqueChannels);
    }

    //get promotion's products
    const productIdsArray = await fetchSalesProducts(client, currentSale as Sale);
    // console.log('productIdsArray', productIdsArray);

    //update assigned products
    await updateProductsCollection(client, saleCollectionId, productIdsArray);

    //update name if diff
    const promoCollectionName = saleCollectionsArr?.[0]?.name;
    if (promoCollectionName !== saleName) {
      //update name of collection
      const { data: updatedCollection } = await client
        .mutation(UpdateCollectionDocument, {
          id: saleCollectionId,
          input: {
            name: saleName,
            slug: titleToSlug(saleName),
            seo: { title: saleName },
          },
        })
        .toPromise();
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
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

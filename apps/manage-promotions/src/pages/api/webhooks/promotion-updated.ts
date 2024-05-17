import { gql } from "urql";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  WebhookSaleFragmentDoc,
  SaleUpdatedWebhookPayloadFragment,
  SaleUpdatedWebhookPayloadFragmentDoc,
  ProductFilterInput,
  InputMaybe,
  StockAvailability,
  ProductCollectionDocument,
  GetProductVariantByIdDocument,
  GetPromotionByNameDocument,
  CollectionsByMetaKeyDocument,
  RemoveProductsFromCollectionDocument,
  AddProductsToCollectionDocument,
  CollectionFilterInput,
  UpdateCollectionDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../../lib/create-graphq-client";
import { titleToSlug } from "../../../lib/to-slug";
import { fetchSaleCollections } from "../../../modules/collections/get-sale-collections";
import {
  createCollection,
  updateProductsCollection,
} from "../../../modules/collections/collection-crud";
import { fetchPromotionsProducts } from "../../../modules/promotions/get-promotion-products";

/**
 * Example payload of the webhook. It will be transformed with graphql-codegen to Typescript type: PromotionCreatedWebhookPayloadFragment
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
 * PromotionCreatedWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const promotionUpdatedWebhook = new SaleorAsyncWebhook<SaleUpdatedWebhookPayloadFragment>({
  name: "Promotion Updated in Saleor",
  webhookPath: "api/webhooks/promotion-updated",
  event: "SALE_UPDATED",
  apl: saleorApp.apl,
  query: SaleUpdatedGraphqlSubscription,
});

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default promotionUpdatedWebhook.createHandler(async (req, res, ctx) => {
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
  console.log(`Promotion was updated: ${payload.sale?.id}`);
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
      GetPromotionByNameDocument,
      { where: { name: { eq: saleName } } }, //, "endDate": { "range": { "gte": nowISO } } } },
      { requestPolicy: "network-only" }
    );

    //const node = result.data.products?.edges.map((e: { node: any }) => e.node);
    const promotionId = result.data?.promotions?.edges?.[0].node?.id || "";
    const promotionRules = result.data?.promotions?.edges?.[0].node?.rules || [];

    //get promotion's products
    const productIdsArray = await fetchPromotionsProducts(client, promotionRules);

    //get existing collection Id, with metadata related to updated promotion
    const collectionFilter: CollectionFilterInput = {
      metadata: [{ key: "promotion", value: promotionId }],
    };
    const saleCollectionsArr = await fetchSaleCollections(client, collectionFilter);
    let promoCollectionId = saleCollectionsArr?.[0]?.id;

    if (!promoCollectionId) {
      console.log("No Collection found associated with promotion:", saleName);
      //return res.status(404).send('Collection not found');
      //create new collection
      promoCollectionId = await createCollection(client, saleName, saleId, promotionId);
    }

    //update assigned products
    await updateProductsCollection(client, promoCollectionId, productIdsArray);

    //update name if diff
    const promoCollectionName = saleCollectionsArr?.[0]?.name;
    if (promoCollectionName !== saleName) {
      //update name of collection
      const { data: updatedCollection } = await client
        .mutation(UpdateCollectionDocument, {
          id: promoCollectionId,
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

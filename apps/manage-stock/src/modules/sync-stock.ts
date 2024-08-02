import { Client } from "urql";
import { fetchProducts } from "./get-product-variants";
import { getProductWithVariant } from "./get-product-with-variant";
import { updateProductVariant } from "./update-product-variant";
import { getStockFromExpert } from "./get-stock-from-expert";
const WEBHOOK_SECRET_KEY = process.env.NEXT_PUBLIC_WEBHOOK_SECRET_KEY;

export const syncStock = async (client: Client, codStoc?: string) => {
  const messages: string[] = [];
  let productFilter = {};
  if (codStoc && codStoc !== "") {
    //get product with variant = codStoc
    const getProductWithVariantResponse = await getProductWithVariant(client, codStoc);
    if (getProductWithVariantResponse) {
      productFilter = {
        ids: [getProductWithVariantResponse],
      };
    }
  }

  const getAllProductsArr = await fetchProducts(client, productFilter);
  const appUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

  if (!appUrl) {
    throw new Error("APP_API_BASE_URL is not defined.");
  }

  for (const product of getAllProductsArr) {
    //foreach variant call expert, and compare stocks, if different, update stock + qlimit in Saleor
    const prodVariants = product.variants;
    for (let i = 0; i < prodVariants.length; i++) {
      const sku = prodVariants[i]["sku"];
      const stock = prodVariants[i]["stocks"][0]["quantity"];
      const qlimit = prodVariants[i]["quantityLimitPerCustomer"];

      const getExpertStoc = await getStockFromExpert(sku);
      console.log("getExpertStoc", getExpertStoc);
      if (
        getExpertStoc !== undefined &&
        getExpertStoc !== null &&
        getExpertStoc >= 0 &&
        stock !== getExpertStoc
      ) {
        // Call the update-stock webhook with the fetched quantity
        try {
          const webhookResponse = await fetch(`${appUrl}/api/webhooks/update-stock`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${WEBHOOK_SECRET_KEY}`,
            },
            body: JSON.stringify({ code: sku, qty: getExpertStoc }),
          });
          const responseBody = await webhookResponse.text(); // Get raw response text
          console.log(`Webhook response body for SKU ${sku}:`, responseBody);
          const webhookData = JSON.parse(responseBody);
          console.log("webhookData", webhookData);
          if (!webhookResponse.ok) {
            messages.push(`Error updating stock for SKU ${sku}: ${webhookData.error}`);
          } else {
            messages.push(`Updated stock for SKU ${sku}: ${webhookData.message}`);
          }
        } catch (error) {
          messages.push(
            `Error calling update-stock webhook for SKU ${sku}: ${(error as any).message}`
          );
        }
      } else if (getExpertStoc !== qlimit && getExpertStoc > 0) {
        try {
          const productInput = {
            sku: sku,
            quantityLimitPerCustomer: getExpertStoc,
          };
          const updateQlimit = await updateProductVariant(client, sku, productInput);
          if (updateQlimit?.error) {
            messages.push(updateQlimit?.error);
          } else {
            messages.push(`Updated quantity limit for SKU ${sku}`);
          }
        } catch (error) {
          messages.push(`Error updating quantity limit for SKU ${sku}: ${(error as any)?.message}`);
        }
      }
    }
  }
  return messages;
};

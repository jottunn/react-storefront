import { Client } from "urql";
import { fetchProducts } from "./get-product-variants";
import { getProductWithVariant } from "./get-product-with-variant";
import { updateProductVariant } from "./update-product-variant";
const WEBHOOK_SECRET_KEY = process.env.NEXT_PUBLIC_WEBHOOK_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

export const handleStockUpdate = async (client: Client, codStoc?: string) => {
  console.log("started handleStockUpdate");
  let messages: string[] = [];

  if (codStoc) {
    const getProductWithVariantResponse = await getProductWithVariant(client, codStoc);
    if (getProductWithVariantResponse) {
      messages = await processSku(getProductWithVariantResponse, client);
    }
  } else {
    const productFilter = { isPublished: true };
    let lastCursor: string | null | undefined = null;
    let hasMoreProducts = true;
    const pageSize = 60;

    while (hasMoreProducts) {
      const getAllProductsArr = await fetchProducts(client, productFilter, lastCursor, pageSize);
      if (getAllProductsArr.products.length === 0) break;

      for (const product of getAllProductsArr.products) {
        const prodVariants = product.variants;
        for (let i = 0; i < prodVariants.length; i++) {
          messages = await processSku(prodVariants[i], client);
        }
      }
      lastCursor = getAllProductsArr?.pageInfo?.endCursor;
      hasMoreProducts = getAllProductsArr?.pageInfo?.hasNextPage || false;
    }
  }
  console.log(`Finished stock update`);
  return messages;
};

const processSku = async (productVariant: any, client: Client) => {
  const messages: string[] = [];
  const sku = productVariant["sku"];
  const stockInfo = productVariant["stocks"];
  const defaultWarehouseStock = stockInfo.find(
    (stock: { warehouse: { slug: string } }) => stock.warehouse.slug === "default"
  );
  const stock = defaultWarehouseStock
    ? defaultWarehouseStock?.quantity
    : productVariant["stocks"][0]?.["quantity"];
  const qlimit = productVariant["quantityLimitPerCustomer"];
  try {
    const response = await fetch(`${appUrl}/api/webhooks/get-expert-stock?articolCod=${sku}`, {
      method: "GET",
    });
    if (!response.ok) messages.push(`Error fetching stock: ${response.statusText}`);

    const data = await response.json();
    const getExpertStoc = data.Cantitate !== undefined ? parseFloat(data.Cantitate) : null;

    if (sku && getExpertStoc !== null && getExpertStoc >= 0 && stock !== getExpertStoc) {
      console.log(`update stoc ${getExpertStoc} for sku ${sku} with initial stoc of ${stock}`);

      const webhookResponse = await fetch(`${appUrl}/api/webhooks/update-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({ code: sku, qty: getExpertStoc }),
      });
      const responseBody = await webhookResponse.text();
      const webhookData = JSON.parse(responseBody);

      if (!webhookResponse.ok) {
        console.log(`Error updating stock for SKU ${sku}: ${webhookData.error}`);
        messages.push(`Error updating stock for SKU ${sku}: ${webhookData.error}`);
      } else {
        messages.push(`Updated stock for SKU ${sku}: ${webhookData.message}`);
      }
    } else if (sku && getExpertStoc && getExpertStoc !== qlimit && getExpertStoc > 0) {
      const productInput = { sku, quantityLimitPerCustomer: getExpertStoc };
      const updateQlimit = await updateProductVariant(client, sku, productInput);

      if (updateQlimit?.error) {
        messages.push(updateQlimit?.error);
      } else {
        messages.push(`Updated quantity limit for SKU ${sku}`);
      }
    } else {
      messages.push("Done. No changes.");
    }
  } catch (error) {
    console.log(`Error fetching or updating stock for SKU ${sku}: ${(error as any).message}`);
    messages.push(`Error fetching or updating stock for SKU ${sku}: ${(error as any).message}`);
  }
  return messages;
};

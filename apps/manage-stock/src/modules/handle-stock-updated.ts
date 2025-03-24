import { Client, gql } from "urql";
import { updateProductVariant } from "./update-product-variant";
export const handleStockUpdated = async (client: Client, payload: any) => {
  /** handles the actions in case stock has been updated: updates qlimit if necessary, unpublishes product or enables track inventory */
  if (!payload) {
    return null;
  }

  let messages = [];
  const productVariantSku = payload.productVariant?.sku;
  const hasStock = payload.productVariant.stocks.some((stock) => stock.quantity > 0);
  const availableQuantity = payload.productVariant.stocks.reduce((max, stock) => {
    return stock.quantity > 0 && stock.quantity > max ? stock.quantity : max;
  }, 0);

  try {
    const updateQlimit = await updateProductVariant(client, productVariantSku, {
      sku: productVariantSku,
      trackInventory: hasStock ? false : true,
      quantityLimitPerCustomer: availableQuantity > 0 ? availableQuantity : null,
    });

    if (updateQlimit?.error) {
      messages.push(updateQlimit?.error);
    } else {
      messages.push(`Updated quantity limit for SKU ${productVariantSku}`);
    }
  } catch (error) {
    messages.push(`Error fetching warehouse details. Error: ${JSON.stringify(error)}`);
    // logger.error(`Error fetching warehouse details. Error: ${JSON.stringify(error)}`);
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
      messages.push(
        `Error updating product channel listing. Error: ${JSON.stringify(
          resultUpdateProductChannel.error ||
            resultUpdateProductChannel.data.productChannelListingUpdate.errors
        )}`
      );
      // logger.error(
      //     `Error updating product channel listing. Error: ${JSON.stringify(
      //         resultUpdateProductChannel.error ||
      //         resultUpdateProductChannel.data.productChannelListingUpdate.errors
      //     )}`
      // );
    } else {
      messages.push(`Updated product channel listing for ${productVariantSku}`);
    }
  } catch (error) {
    messages.push(`Error updating product channel listing. Error: ${JSON.stringify(error)}`);
    // logger.error(`Error updating product channel listing. Error: ${JSON.stringify(error)}`);
  }

  console.log(
    `Stock updated job for ${productVariantSku}  with messages: ${JSON.stringify(messages)}`
  );
  return messages;
};

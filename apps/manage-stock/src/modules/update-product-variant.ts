import { Client } from "urql";
import { ProductVariantInput, UpdateProductVariantDocument } from "../../generated/graphql";

export async function updateProductVariant(
  client: Client,
  sku: string,
  productFilter: ProductVariantInput
) {
  try {
    const { data } = await client.mutation(
      UpdateProductVariantDocument,
      {
        sku: sku,
        input: productFilter,
      },
      { requestPolicy: "network-only" }
    );

    if (data?.productVariantUpdate?.errors.length) {
      return {
        error: "Error for " + sku + ": " + data?.productVariantUpdate?.errors[0].message,
      };
    }
    return { success: true };
  } catch (error) {
    console.log("Error saving sku: " + sku + (error as any).message);
    return { error: "Error saving sku: " + sku + (error as any).message };
  }
}

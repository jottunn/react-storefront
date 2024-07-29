import { mapEdgesToItems } from "@/lib/maps";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { BASE_URL } from "@/lib/const";
import {
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
} from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { defaultRegionQuery } from "@/lib/regions";

async function getProducts() {
  try {
    const filter: ProductFilterInput = {
      isPublished: true,
      stockAvailability: "IN_STOCK",
      isVisibleInListing: true,
    };
    const queryVariables = {
      filter,
      first: 700,
      ...defaultRegionQuery(),
    };
    const { products } = await executeGraphQL<ProductCollectionQuery, { filter: any }>(
      ProductCollectionDocument,
      { variables: queryVariables, withAuth: false, revalidate: 60 * 60 * 24 },
    );
    if (products) {
      let sitemapProducts = products ? mapEdgesToItems(products) : [];
      sitemapProducts = groupProductsByColor(sitemapProducts as GroupedProduct[]);
      const productUrls = sitemapProducts.map((product) => {
        const checkProductVariant = product.variants?.filter(
          (variant) => variant.quantityAvailable != null && variant.quantityAvailable > 0,
        );
        const variant = checkProductVariant?.[0];
        return {
          sku: variant?.sku,
          url: `${BASE_URL}/p/${product.slug}?variant=${variant?.id}`,
          lastModified: variant?.updatedAt,
        };
      });
      return [...productUrls];
    }
  } catch (err) {
    console.error("Error:", err);
  }
  return [];
}
export default async function FeedPage() {
  const productRoutes = await getProducts();
  if (productRoutes) {
    return (
      <div>
        <h1>Product Feed</h1>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {productRoutes.map((product, index) => (
              <tr key={index}>
                <td>{product.sku}</td>
                <td>
                  <a href={product.url} target="_blank" rel="noopener noreferrer">
                    {product.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <></>;
}

import { getSitemapProducts } from "../sitemap";

export default async function FeedPage() {
  const productRoutes = await getSitemapProducts();
  if (productRoutes) {
    return (
      <div className="container px-8 p-4">
        <main>
          <h1>Product Feed</h1>
          <br />
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
        </main>
      </div>
    );
  }
  return <></>;
}

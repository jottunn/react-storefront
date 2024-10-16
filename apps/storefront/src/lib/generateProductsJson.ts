import fs from "fs/promises";
import path from "path";
import { defaultRegionQuery } from "./regions";
import { getProductCollection } from "src/app/actions";

const processAttributes = (productAttributes: any) => {
  const attributesMap = new Map();
  productAttributes.forEach((attr: { attribute: any; values: any }) => {
    const { attribute, values } = attr;
    if (!attributesMap.has(attribute.slug)) {
      attributesMap.set(attribute.slug, {
        id: attribute.id,
        name: attribute.name,
        inputType: attribute.inputType,
        values: new Map(),
      });
    }

    values.forEach((value: { slug: string; id: string | number; name: string }) => {
      attributesMap.get(attribute.slug).values.set(value.slug, {
        id: value.id,
        name: value.name,
      });
    });
  });
  // Convert Map to object for easier JSON serialization
  const attributesObject = Object.fromEntries(
    Array.from(attributesMap, ([slug, attr]) => [
      slug,
      {
        ...attr,
        values: Object.fromEntries(attr.values),
      },
    ]),
  );

  return attributesObject;
};

async function generateProductsJson() {
  try {
    const queryVariables = {
      filter: {
        stockAvailability: "IN_STOCK",
        isPublished: true,
        isVisibleInListing: true,
      },
      first: 1000,
      ...defaultRegionQuery(),
    };
    const products = await getProductCollection(queryVariables);

    if (!products) {
      console.log("No products found");
      return;
    }

    // const productsData = products.edges.map(({ node }: any) => ({
    //     name: node.name,
    //     id: node.id,
    //     attributes: processAttributes(node.attributes),
    //     collections: node.collections?.map((collection: any) => collection.name) ?? [],
    //     categories: node.category ? [node.category.name] : [],
    //     inStock: node.variants?.some((variant: any) => variant.quantityAvailable && variant.quantityAvailable > 0),
    //     //pricing:
    // }));

    const productsData = {
      edges: products.edges.map(({ node }: any) => ({
        cursor: btoa(node.id), // Base64 encode the ID for the cursor
        node: {
          id: node.id,
          name: node.name,
          attributes: node.attributes.map((attr: any) => ({
            attribute: {
              id: attr.attribute.id,
              slug: attr.attribute.slug,
              name: attr.attribute.name,
              inputType: attr.attribute.inputType,
            },
            values: attr.values.map((value: any) => ({
              id: value.id,
              name: value.name,
              slug: value.slug,
            })),
          })),
          variants: node.variants.map((variant: any) => ({
            quantityAvailable: variant.quantityAvailable,
            attributes: variant.attributes.map((attr: any) => ({
              attribute: {
                id: attr.attribute.id,
                slug: attr.attribute.slug,
                name: attr.attribute.name,
                translation: attr.attribute.translation,
                inputType: attr.attribute.inputType,
                type: attr.attribute.type,
                unit: attr.attribute.unit,
              },
              values: attr.values.map((value: any) => ({
                id: value.id,
                name: value.name,
                translation: value.translation,
                slug: value.slug,
                value: value.value,
                reference: value.reference,
              })),
            })),
          })),
          category: node.category
            ? {
                id: node.category.id,
                slug: node.category.slug,
                name: node.category.name,
                ancestors: node.category.ancestors?.edges.map((edge: any) => edge.node),
              }
            : null,
          collections: node.collections?.map((collection: any) => collection.id) ?? [],
        },
      })),
    };
    const jsonContent = JSON.stringify(productsData, null, 2);
    await fs.writeFile(path.join(process.cwd(), "public", "products.json"), jsonContent);

    console.log("Products JSON generated successfully");
  } catch (error) {
    console.error("Failed to generate products JSON:", error);
  }
}

// Only run the function if this script is being run directly
if (require.main === module) {
  generateProductsJson();
}

// Export the function so it can be imported and used elsewhere if needed
export { generateProductsJson };

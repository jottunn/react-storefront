import { getProductsData } from "src/app/actions";
import fs from "fs/promises";
import path from "path";

// Attributes to exclude from the index
const EXCLUDED_ATTRIBUTES = ["ghid-marimi", "recommended", "culoare-comerciala"];

interface AttributeMetadata {
  categories: Set<string>;
  collections: Set<string>;
  productIds: Set<string>;
}

interface ProductAttributes {
  [key: string]: Set<string>;
}

interface ProductInfo {
  name: string;
  category: string;
  collections: string[];
  attributes: ProductAttributes;
}

interface AttributeConfig {
  label: string;
  inputType: string;
  options: any[];
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  ancestors: any[];
}

interface FilterIndex {
  attributes: { [key: string]: Set<string> };
  relationships: { [key: string]: { [key: string]: { [key: string]: Set<string> } } };
  metadata: { [key: string]: { [key: string]: AttributeMetadata } };
  products: { [key: string]: ProductInfo };
  attributeConfig: { [key: string]: AttributeConfig };
  categoryStructure: Map<string, CategoryInfo>;
}

// Create a simpler, flatter index structure
const index: FilterIndex = {
  // All unique values for each attribute
  attributes: {},
  // Relationships between attributes
  relationships: {},
  // Categories and collections for each value
  metadata: {},
  // Product information for search and filtering
  products: {},
  // New fields for display configuration
  attributeConfig: {},
  categoryStructure: new Map(),
};

interface Ancestor {
  slug: string;
  [key: string]: any;
}

interface AttributeValue {
  value: boolean;
  slug?: string;
  name: string;
}

interface Attribute {
  attribute: {
    slug: string;
    inputType: string;
    name: string;
  };
  values: AttributeValue[];
}

interface Product {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    ancestors?: Ancestor[];
  };
  collections: string[];
  attributes: Attribute[];
  variants: {
    attributes: Attribute[];
  }[];
}
function addToIndex(
  attrSlug: string,
  value: string,
  otherAttrs: { [key: string]: string[] },
  category: string,
  collections: string[],
  product: Product,
) {
  // Skip excluded attributes
  if (EXCLUDED_ATTRIBUTES.includes(attrSlug)) return;

  // Initialize attribute if not exists
  if (!index.attributes[attrSlug]) {
    index.attributes[attrSlug] = new Set();
  }
  index.attributes[attrSlug].add(value);

  // Initialize relationships if not exists
  if (!index.relationships[attrSlug]) {
    index.relationships[attrSlug] = {};
  }
  if (!index.relationships[attrSlug][value]) {
    index.relationships[attrSlug][value] = {};
  }

  // Initialize metadata if not exists
  if (!index.metadata[attrSlug]) {
    index.metadata[attrSlug] = {};
  }
  if (!index.metadata[attrSlug][value]) {
    index.metadata[attrSlug][value] = {
      categories: new Set(),
      collections: new Set(),
      productIds: new Set(),
    };
  }
  index.metadata[attrSlug][value].categories.add(category);

  // Add ancestor categories to metadata
  if (product.category?.ancestors) {
    product.category.ancestors.forEach((ancestor) => {
      index.metadata[attrSlug][value].categories.add(ancestor.slug);
    });
  }

  collections.forEach((collection) => {
    index.metadata[attrSlug][value].collections.add(collection);
  });
  index.metadata[attrSlug][value].productIds.add(product.id);

  // Add product to products index
  if (!index.products[product.id]) {
    index.products[product.id] = {
      name: product.name,
      category: category,
      collections: collections,
      attributes: {},
    };
  }
  if (!index.products[product.id].attributes[attrSlug]) {
    index.products[product.id].attributes[attrSlug] = new Set();
  }
  index.products[product.id].attributes[attrSlug].add(value);

  // Add relationships with other attributes
  for (const [otherSlug, otherValues] of Object.entries(otherAttrs)) {
    // Skip excluded attributes
    if (EXCLUDED_ATTRIBUTES.includes(otherSlug)) continue;
    if (otherSlug === attrSlug) continue;

    // Initialize relationship for this attribute value
    if (!index.relationships[attrSlug][value][otherSlug]) {
      index.relationships[attrSlug][value][otherSlug] = new Set();
    }

    // Add all other values as relationships
    otherValues.forEach((v) => {
      index.relationships[attrSlug][value][otherSlug].add(v);
    });

    // Also add reverse relationship
    if (!index.relationships[otherSlug]) {
      index.relationships[otherSlug] = {};
    }
    otherValues.forEach((otherValue) => {
      if (!index.relationships[otherSlug][otherValue]) {
        index.relationships[otherSlug][otherValue] = {};
      }
      if (!index.relationships[otherSlug][otherValue][attrSlug]) {
        index.relationships[otherSlug][otherValue][attrSlug] = new Set();
      }
      index.relationships[otherSlug][otherValue][attrSlug].add(value);
    });
  }

  // Add category structure if it exists
  if (product.category) {
    const categoryInfo = product.category;
    if (!index.categoryStructure.has(categoryInfo.slug)) {
      index.categoryStructure.set(categoryInfo.slug, {
        id: categoryInfo.id,
        name: categoryInfo.name,
        slug: categoryInfo.slug,
        ancestors: categoryInfo.ancestors || [],
      });
    }
  }

  // Add attribute config if not exists
  if (!index.attributeConfig[attrSlug]) {
    // Find the attribute definition from the product
    let inputType = "DROPDOWN"; // default
    let attributeName = attrSlug;

    // Look for the attribute in product attributes
    const productAttr = product.attributes.find((attr) => attr.attribute.slug === attrSlug);
    if (productAttr) {
      inputType = productAttr.attribute.inputType;
      attributeName = productAttr.attribute.name;
    } else {
      // Look for the attribute in variant attributes
      for (const variant of product.variants) {
        const variantAttr = variant.attributes.find((attr) => attr.attribute.slug === attrSlug);
        if (variantAttr) {
          inputType = variantAttr.attribute.inputType;
          attributeName = variantAttr.attribute.name;
          break;
        }
      }
    }

    // Convert inputType to lowercase for consistency
    inputType = inputType.toUpperCase();

    index.attributeConfig[attrSlug] = {
      label: attributeName,
      inputType: inputType,
      options: [],
    };
  }

  // Add option to attribute config if not exists
  const option = {
    slug: value,
    label: value,
    value: "#000000",
  };

  // Find the name in product attributes
  const productAttr = product.attributes.find((attr) => attr.attribute.slug === attrSlug);
  if (productAttr) {
    const attrValue = productAttr.values.find((v) => v.slug === value);
    if (attrValue) {
      option.label = attrValue.name;
      if (
        index.attributeConfig[attrSlug].inputType === "SWATCH" &&
        attrValue.value &&
        typeof attrValue.value === "string"
      ) {
        option.value = attrValue.value;
      }
    }
  } else {
    // Look in variant attributes
    for (const variant of product.variants) {
      const variantAttr = variant.attributes.find((attr) => attr.attribute.slug === attrSlug);
      if (variantAttr) {
        const attrValue = variantAttr.values.find((v) => v.slug === value);
        if (attrValue) {
          option.label = attrValue.name;
          if (
            index.attributeConfig[attrSlug].inputType === "SWATCH" &&
            attrValue.value &&
            typeof attrValue.value === "string"
          ) {
            option.value = attrValue.value;
          }
          break;
        }
      }
    }
  }

  if (!index.attributeConfig[attrSlug].options.some((opt) => opt.slug === value)) {
    index.attributeConfig[attrSlug].options.push(option);
  }
}

async function generateFilterIndex() {
  try {
    const productsData = await getProductsData();
    if (!productsData) {
      console.log("No products data available");
      return;
    }
    const filteredProductsData = {
      ...productsData,
      edges: productsData.edges.map((edge: { node: { variants: any[] } }) => ({
        ...edge,
        node: {
          ...edge.node,
          variants: edge.node.variants.filter((variant) => variant.quantityAvailable > 0),
        },
      })),
    };
    // Process products and build index
    for (const edge of filteredProductsData.edges) {
      const product = edge.node;
      const category = product.category?.slug || "";
      const collections = product.collections || [];

      // Get product-level attributes
      const productAttrs: any = {};
      for (const attr of product.attributes) {
        // Skip excluded attributes
        if (EXCLUDED_ATTRIBUTES.includes(attr.attribute.slug)) continue;

        for (const value of attr.values) {
          if (!productAttrs[attr.attribute.slug]) productAttrs[attr.attribute.slug] = [];
          productAttrs[attr.attribute.slug].push(value.slug || value.name.toLowerCase());
        }
      }

      // Get variant attributes
      for (const variant of product.variants) {
        const variantAttrs: any = {};
        for (const attr of variant.attributes) {
          // Skip excluded attributes
          if (EXCLUDED_ATTRIBUTES.includes(attr.attribute.slug)) continue;

          for (const value of attr.values) {
            if (!variantAttrs[attr.attribute.slug]) variantAttrs[attr.attribute.slug] = [];
            variantAttrs[attr.attribute.slug].push(value.slug || value.name.toLowerCase());
          }
        }

        // Merge attributes
        const allAttrs = { ...productAttrs, ...variantAttrs };

        // Add to index
        for (const [attrSlug, values] of Object.entries(allAttrs)) {
          (values as any).forEach((value: string) => {
            addToIndex(attrSlug, value, allAttrs, category, collections, product);
          });
        }
      }
    }

    // Convert Sets to Arrays for JSON serialization
    const serializedIndex: any = {
      attributes: {},
      relationships: {},
      metadata: {},
      products: {},
      attributeConfig: {},
      categoryStructure: Array.from(index.categoryStructure.values()),
    };

    // Convert attributes
    for (const [attrSlug, values] of Object.entries(index.attributes)) {
      serializedIndex.attributes[attrSlug] = Array.from(values).sort();
    }

    // Convert relationships
    for (const [attrSlug, values] of Object.entries(index.relationships)) {
      serializedIndex.relationships[attrSlug] = {};
      for (const [value, relationships] of Object.entries(values)) {
        serializedIndex.relationships[attrSlug][value] = {};
        for (const [otherSlug, otherValues] of Object.entries(relationships)) {
          serializedIndex.relationships[attrSlug][value][otherSlug] =
            Array.from(otherValues).sort();
        }
      }
    }

    // Convert metadata
    for (const [attrSlug, values] of Object.entries(index.metadata)) {
      serializedIndex.metadata[attrSlug] = {};
      for (const [value, data] of Object.entries(values)) {
        serializedIndex.metadata[attrSlug][value] = {
          categories: Array.from(data.categories).sort(),
          collections: Array.from(data.collections).sort(),
          productIds: Array.from(data.productIds).sort(),
        };
      }
    }

    // Convert products
    for (const [productId, product] of Object.entries(index.products)) {
      serializedIndex.products[productId] = {
        name: product.name,
        category: product.category,
        collections: product.collections,
        attributes: {},
      };
      for (const [attrSlug, values] of Object.entries(product.attributes)) {
        serializedIndex.products[productId].attributes[attrSlug] = Array.from(values).sort();
      }
    }

    for (const [attrSlug, config] of Object.entries(index.attributeConfig)) {
      serializedIndex.attributeConfig[attrSlug] = {
        ...config,
        options: config.options.sort((a, b) => a.label.localeCompare(b.label)),
      };
    }

    // Write the JSON file
    const jsonContent = JSON.stringify(serializedIndex, null, 2);
    await fs.writeFile(
      path.join(process.cwd(), "public/generated", "filter-index.json"),
      jsonContent,
    );

    console.log("Filter index JSON generated successfully");
  } catch (error) {
    console.error("Failed to generate filter index JSON:", error);
  }
}

// Only run the function if this script is being run directly
if (require.main === module) {
  generateFilterIndex();
}

// Export the function so it can be imported and used elsewhere if needed
export { generateFilterIndex };

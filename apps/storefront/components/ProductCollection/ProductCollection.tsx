import React, { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { mapEdgesToItems } from "@/lib/maps";
import {
  OrderDirection,
  Product,
  ProductCardFragment,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCountableEdge,
  ProductFilterInput,
  ProductOrderField,
  ProductVariant,
  ProductWhereInput,
} from "@/saleor/api";

import { Pagination } from "../Pagination";
import { useRegions } from "../RegionsProvider";
import { Spinner } from "../Spinner";
import { messages } from "../translations";
import { useApolloClient } from "@apollo/client";
import { ProductCard } from "./ProductCard";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";

export interface ProductCollectionProps {
  filter?: ProductFilterInput;
  where?: ProductWhereInput;
  sortBy?: {
    field: ProductOrderField;
    direction?: OrderDirection;
  };
  allowMore?: boolean;
  perPage?: number;
  // setCounter?: (value: number) => void;
}

export function ProductCollection({
  filter,
  where,
  sortBy,
  // setCounter,
  allowMore = true,
  perPage = 30,
}: ProductCollectionProps) {
  const t = useIntl();
  const { query } = useRegions();
  const apolloClient = useApolloClient();
  const [productCollection, setProductCollection] = useState<ProductCollectionQuery>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProductCollection = useCallback(async () => {
    setIsLoading(true);
    const queryVariables = {
      filter,
      where,
      first: perPage,
      ...query,
      ...(sortBy?.field &&
        sortBy?.direction && {
          sortBy: {
            direction: sortBy.direction,
            field: sortBy.field,
          },
        }),
    };

    try {
      const { data } = await apolloClient.query({
        query: ProductCollectionDocument,
        variables: queryVariables,
        //fetchPolicy: 'network-only', // Ensures fresh data is fetched, adjust as needed
      });
      if (data) {
        setProductCollection(data as ProductCollectionQuery);
      }
    } catch (err) {
      console.error("Error:", err);
      // Handle error
    }
    setIsLoading(false);
  }, [JSON.stringify(filter), sortBy]);

  useEffect(() => {
    fetchProductCollection().catch((error) => {
      console.error("Failed to fetch filters:", error);
    });
  }, [fetchProductCollection]);

  const onLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      // Fetch new products using the endCursor of the current product collection
      const { data: newProductsData } = await apolloClient.query({
        query: ProductCollectionDocument,
        variables: {
          filter,
          first: perPage,
          ...query,
          ...(sortBy?.field &&
            sortBy?.direction && {
              sortBy: {
                direction: sortBy.direction,
                field: sortBy.field,
              },
            }),
          after: productCollection?.products?.pageInfo.endCursor,
        },
        fetchPolicy: "network-only", // Ensures fresh data is fetched
      });

      if (newProductsData) {
        setProductCollection((prevState) => {
          // Get current products
          const currentProducts = prevState?.products?.edges || [];

          // Get new products
          const newProducts = newProductsData.products.edges as ProductCountableEdge[];

          // Create a map to filter out duplicate products based on their ID
          const productMap = new Map<string, ProductCountableEdge>();
          currentProducts.forEach((product) => {
            productMap.set(product.node.id, product as ProductCountableEdge);
          });
          newProducts.forEach((product: ProductCountableEdge) =>
            productMap.set(product.node.id, product)
          );

          // Convert the map back to an array
          const uniqueProducts = Array.from(productMap.values());

          // Update the state with the unique merged products
          return {
            ...prevState,
            products: {
              ...prevState?.products,
              edges: uniqueProducts,
              pageInfo: newProductsData.products.pageInfo, // Update pageInfo with the latest from newProductsData
            },
          };
        });
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    }
    setIsLoadingMore(false);
  }, [productCollection, apolloClient]);

  if (isLoading) return <Spinner />;

  /**
   * checks both product-level attributes and variant-level attributes against the filter,
   * and to ensure that a product is included in the final output only if it has compliant variants
   * (while also considering the product's own attributes)
   * @param variant
   * @param filter
   * @returns
   */
  function doesProductComplyWithFilter(
    product: ProductCardFragment,
    filter: ProductFilterInput
  ): boolean {
    // If the filter specifies attributes, check compliance based on product-level attributes
    if (filter.attributes && filter.attributes.length > 0) {
      return filter.attributes.every((filterAttr) => {
        // Check if the product has the filter attribute
        const productAttribute = product.attributes.find(
          (productAttr) => productAttr.attribute.slug === filterAttr.slug
        );

        // If the product does not have the attribute at all, consider it compliant for this specific attribute
        if (!productAttribute) {
          return true; // Skip to the next filter attribute because the absence is considered compliant
        }

        // If the product has the attribute, check if any of its values match the filter's values
        return productAttribute.values.some((value) =>
          filterAttr.values?.includes(value.slug ?? "")
        );
      });
    }

    // If filter.attributes is null, undefined, or empty, consider the product compliant by default
    return true;
  }

  function variantSatisfiesFilter(variant: ProductVariant, filter: ProductFilterInput): boolean {
    let isCompliant = true;
    if (filter.attributes && filter.attributes.length > 0) {
      for (const filterAttr of filter.attributes) {
        // Check if the variant has the filter attribute
        const variantAttribute = variant.attributes.find(
          (variantAttr) => variantAttr.attribute.slug === filterAttr.slug
        );

        // If the variant does not have the attribute at all, consider it compliant for this specific attribute
        if (!variantAttribute) {
          continue; // Skip to the next filter attribute
        }

        // If the variant has the attribute, check if any of its values match the filter's values
        const hasMatchingValue = variantAttribute.values.some((value) =>
          filterAttr.values?.includes(value.slug ?? "")
        );

        if (!hasMatchingValue) {
          isCompliant = false;
          break; // Exit early if any filter criterion is not met
        }
      }
    }

    // Additionally, check stock availability if required by the filter
    if (
      filter.stockAvailability === "IN_STOCK" &&
      (variant.quantityAvailable == null || variant.quantityAvailable <= 0)
    ) {
      isCompliant = false;
    }

    return isCompliant;
  }

  // Filter products based on the variants that satisfy the filter criteria
  function filterAndTransformProducts(products: GroupedProduct[], filter: ProductFilterInput) {
    return products.reduce((acc: Product[], product) => {
      // First, check if the product itself complies with the filter (based on product-level attributes)
      const productComplies = doesProductComplyWithFilter(product, filter);

      if (!productComplies) {
        // If the product does not comply with the product-level attributes, do not include it in the result
        return acc;
      }

      // Filter variants for this product based on compliance with the filter
      const compliantVariants = product.variants?.filter((variant) =>
        variantSatisfiesFilter(variant, filter)
      );

      if (compliantVariants && compliantVariants.length > 0) {
        // Construct a new product object with only compliant variants
        const transformedProduct = {
          ...product, // Spread the original product to copy its properties
          variants: compliantVariants, // Assign the filtered, compliant variants
        };
        acc.push(transformedProduct); // Add the transformed product to the accumulator
      }

      return acc;
    }, []);
  }
  // useEffect(() => {
  //   if (setCounter) {
  //     setCounter(data?.products?.totalCount || 0);
  //   }
  // }, [setCounter, data?.products?.totalCount]);

  // if (error) return <p>Error</p>;

  let products = mapEdgesToItems(productCollection?.products);

  if (products.length > 0 && filter?.attributes) {
    products = filterAndTransformProducts(products as GroupedProduct[], filter);
  }
  if (products.length === 0) {
    return <p>{t.formatMessage(messages.noProducts)}</p>;
  }

  products = groupProductsByColor(products as GroupedProduct[]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6" data-testid="productsList">
        {products.map((product, index) => (
          <ProductCard
            key={`${product.id}-${product.variants?.[0]?.id || index}`}
            compliantVariant={product?.variants?.[0] as ProductVariant}
            product={product as GroupedProduct}
            priority={index < 9}
            loading={index < 9 ? "eager" : "lazy"}
          />
        ))}
      </div>

      {isLoadingMore && <Spinner />}

      {allowMore && (
        <Pagination
          onLoadMore={onLoadMore}
          pageInfo={productCollection?.products?.pageInfo}
          // itemsCount={productCollection?.products?.edges.length}
          // totalCount={productCollection?.products?.totalCount || undefined}
        />
      )}
    </>
  );
}

export default React.memo(ProductCollection);

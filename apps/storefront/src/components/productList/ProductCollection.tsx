import React, { useCallback, useEffect, useRef, useState } from "react";
import { mapEdgesToItems } from "@/lib/maps";
import {
  OrderDirection,
  Product,
  ProductCardFragment,
  ProductCollectionQuery,
  ProductCountableEdge,
  ProductFilterInput,
  ProductOrderField,
  ProductVariant,
  ProductWhereInput,
} from "@/saleor/api";
import { Spinner } from "../Spinner";
import { defaultRegionQuery } from "@/lib/regions";
import { getProductCollection } from "src/app/actions";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import { Messages } from "@/lib/util";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./Pagination";
import isEqual from "lodash.isequal";

export interface ProductCollectionProps {
  filter?: ProductFilterInput;
  where?: ProductWhereInput;
  sortBy?: {
    field: ProductOrderField;
    direction?: OrderDirection;
  };
  allowMore?: boolean;
  perPage?: number;
  messages: Messages;
  // setCounter?: (value: number) => void;
}

export function ProductCollection({
  filter,
  where,
  sortBy,
  messages,
  // setCounter,
  allowMore = true,
  perPage = 30,
}: ProductCollectionProps) {
  const [productCollection, setProductCollection] = useState<ProductCollectionQuery>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  type SortByType =
    | {
        field: ProductOrderField;
        direction?: OrderDirection;
      }
    | undefined;
  const fetchProductCollection = useCallback(
    async (afterCursor?: string) => {
      setIsLoading(true);
      const queryVariables = {
        filter,
        where,
        first: perPage,
        after: afterCursor,
        ...defaultRegionQuery(),
        ...(sortBy?.field &&
          sortBy?.direction && {
            sortBy: {
              direction: sortBy.direction,
              field: sortBy.field,
            },
          }),
      };
      try {
        const products = await getProductCollection(queryVariables);
        if (products) {
          setProductCollection(products as any);
        }
      } catch (err) {
        console.error("Error:", err);
        // Handle error
      }
      setIsLoading(false);
    },
    [filter, sortBy],
  );

  const previousFilter = useRef<ProductFilterInput | undefined>(undefined);
  const previousSortBy = useRef<SortByType>(undefined);
  useEffect(() => {
    if (!isEqual(filter, previousFilter.current) || !isEqual(sortBy, previousSortBy.current)) {
      previousFilter.current = filter;
      previousSortBy.current = sortBy;
      fetchProductCollection().catch((error) => {
        console.error("Failed to fetch filters:", error);
      });
    }
  }, [fetchProductCollection]);

  const onLoadMore = useCallback(async () => {
    setIsLoadingMore(true);

    try {
      // Fetch new products using the endCursor of the current product collection
      const newProductsData = await getProductCollection(
        productCollection?.products?.pageInfo.endCursor,
      );
      if (newProductsData) {
        setProductCollection((prevState) => {
          // Get current products
          const currentProducts = prevState?.products?.edges || [];

          // Get new products
          const newProducts = newProductsData.edges as ProductCountableEdge[];

          // Create a map to filter out duplicate products based on their ID
          const productMap = new Map<string, ProductCountableEdge>();
          currentProducts.forEach((product) => {
            productMap.set(product.node.id, product as ProductCountableEdge);
          });
          newProducts.forEach((product: ProductCountableEdge) =>
            productMap.set(product.node.id, product),
          );
          // Convert the map back to an array
          const uniqueProducts = Array.from(productMap.values());

          // Update the state with the unique merged products
          return {
            ...prevState,
            products: {
              ...prevState?.products,
              edges: uniqueProducts,
              pageInfo: newProductsData.pageInfo, // Update pageInfo with the latest from newProductsData
            },
          };
        });
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    }
    setIsLoadingMore(false);
  }, [productCollection]);

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
    filter: ProductFilterInput,
  ): boolean {
    // If the filter specifies attributes, check compliance based on product-level attributes
    if (filter.attributes && filter.attributes.length > 0) {
      return filter.attributes.every((filterAttr) => {
        // Check if the product has the filter attribute
        const productAttribute = product.attributes.find(
          (productAttr) => productAttr.attribute.slug === filterAttr.slug,
        );

        // If the product does not have the attribute at all, consider it compliant for this specific attribute
        if (!productAttribute) {
          return true; // Skip to the next filter attribute because the absence is considered compliant
        }

        // If the product has the attribute, check if any of its values match the filter's values
        return productAttribute.values.some((value) =>
          filterAttr.values?.includes(value.slug ?? ""),
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
          (variantAttr) => variantAttr.attribute.slug === filterAttr.slug,
        );

        // If the variant does not have the attribute at all, consider it compliant for this specific attribute
        if (!variantAttribute) {
          continue; // Skip to the next filter attribute
        }

        // If the variant has the attribute, check if any of its values match the filter's values
        const hasMatchingValue = variantAttribute.values.some((value) =>
          filterAttr.values?.includes(value.slug ?? ""),
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
        variantSatisfiesFilter(variant, filter),
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

  // console.log('productCollection', productCollection);
  if (!productCollection) {
    return <Spinner />;
  }
  let products = mapEdgesToItems(productCollection as any);

  if (products.length > 0 && filter?.attributes) {
    products = filterAndTransformProducts(products as GroupedProduct[], filter);
  }
  if (products.length === 0) {
    return <p className="text-md">{messages["app.ui.noProductsInfo"]}</p>;
  }

  products = groupProductsByColor(products as GroupedProduct[]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6" data-testid="productsList">
        {products.map((product: any, index) => (
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
          messages={messages}
          // itemsCount={productCollection?.products?.edges.length}
          // totalCount={productCollection?.products?.totalCount || undefined}
        />
      )}
    </>
  );
}

export default React.memo(ProductCollection);

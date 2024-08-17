"use client";

import { executeGraphQL } from "@/lib/graphql";
import { mapEdgesToItems } from "@/lib/maps";
import { defaultRegionQuery } from "@/lib/regions";
import {
  CategoriesByFilterDocument,
  CategoriesByFilterQuery,
  CategoryFilterInput,
  LanguageCodeEnum,
  Product,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCountableConnection,
} from "@/saleor/api";
import { GroupedProduct, groupProductsByColor } from "@/lib/product";
import Spinner from "@/components/Spinner";
import React from "react";
import SwiperComponent from "@/components/SwiperComponent";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { getOrderValue, Messages } from "@/lib/util";

interface RelatedProductsProps {
  product: any;
  messages: Messages;
  recommendedProducts: any[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  product,
  messages,
  recommendedProducts,
}) => {
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const fetchRelatedProducts = async () => {
      const categoryId = product?.category?.id ?? "";
      const attributeGender = product.attributes.find(
        (attr: { attribute: { slug: string } }) => attr.attribute.slug === "gen",
      );
      const gender = attributeGender?.values?.[0]?.name;
      let filterAttributes = [];
      if (gender === "copii") {
        filterAttributes.push({
          slug: "gen",
          values: [gender],
        });
      } else {
        filterAttributes.push({
          slug: "gen",
          values: [gender, "unisex"],
        });
      }

      /** MAYbe to be implemented, to retreieve products from other bro categories */
      // let parentsCategory;
      //const parents = parentCategories.map(parentCategory => parentCategory.id);
      //const parentCategories = mapEdgesToItems<Category>(product.category?.ancestors);
      // const categoryFilter: CategoryFilterInput = {
      //     ids: parents
      // };
      // try {
      //     const response = await executeGraphQL<
      //         CategoriesByFilterQuery,
      //         { filter: CategoryFilterInput; locale: LanguageCodeEnum }
      //     >(CategoriesByFilterDocument, {
      //         variables: {
      //             filter: categoryFilter,
      //             ...defaultRegionQuery(),
      //         },
      //         revalidate: 60 * 5,
      //     });
      //     parentsCategory = response.categories ? mapEdgesToItems(response.categories) : [];
      // } catch {
      //     return [];
      // }

      // const allChildrenIds = parentsCategory.flatMap(parent =>
      //     mapEdgesToItems(parent.children).map(child => child.id)
      // );
      // const filteredChildrenIds = allChildrenIds.filter(id => id !== categoryId);
      // const filterCategories = [categoryId, filteredChildrenIds[0], filteredChildrenIds[1]];

      let relatedProductsResponse: ProductCountableConnection;
      try {
        const response = await executeGraphQL<
          ProductCollectionQuery,
          { filter: any; first: number; channel: string; locale: string }
        >(ProductCollectionDocument, {
          variables: {
            filter: {
              attributes: filterAttributes,
              categories: categoryId,
              stockAvailability: "IN_STOCK",
            },
            first: 12,
            ...defaultRegionQuery(),
          },
          revalidate: 60 * 60,
        });
        relatedProductsResponse = response.products as ProductCountableConnection;
      } catch {
        return null;
      }
      const recommendedSlugs = recommendedProducts.map((product: Product) => product.slug);

      let relatedProducts = mapEdgesToItems(relatedProductsResponse).filter(
        (relatedProduct) =>
          relatedProduct.slug !== product.slug && !recommendedSlugs.includes(relatedProduct.slug),
      );
      relatedProducts = groupProductsByColor(relatedProducts as GroupedProduct[]);
      setRelatedProducts(relatedProducts);
      setLoading(false);
    };

    fetchRelatedProducts();
  }, [product]);

  if (loading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="container px-8 py-12 md:py-40 border-t">
          <div className="swiper-header flex justify-center items-center space-x-4">
            <h2 className="text-lg uppercase m-0 flex-1 text-left mb-8">
              {messages["app.relatedProducts"]}
            </h2>
            <div className="swiper-navigation flex mb-8">
              <button
                className="swiper-button-prev-rel custom-prev inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="Prev"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-500" />
              </button>
              <button
                className="swiper-button-next-rel custom-next inline-flex justify-center items-center w-10 h-10 border border-gray-600 hover:border-gray-700 disabled:border-gray-200 ml-2 rounded-full transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          <div style={{ maxHeight: "400px" }}>
            <SwiperComponent
              products={relatedProducts as any}
              prevButtonClass="swiper-button-prev-rel"
              nextButtonClass="swiper-button-next-rel"
            />
          </div>
        </div>
      )}
    </>
  );
};
export default RelatedProducts;

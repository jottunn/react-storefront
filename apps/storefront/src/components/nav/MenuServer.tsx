import { executeGraphQL } from "src/lib/graphql";
import {
  CategoriesSortedByDocument,
  CategoriesSortedByQuery,
  CategoriesSortedByQueryVariables,
  MenuGetBySlugDocument,
  MenuGetBySlugQuery,
  MenuGetBySlugQueryVariables,
} from "@/saleor/api";
import { ReactNode } from "react";
import { defaultRegionQuery } from "@/lib/regions";
import { mapEdgesToItems } from "@/lib/maps";

interface ServerMenuProps {
  children: (leftNavLinks: MenuGetBySlugQuery, rightNavLinks: MenuGetBySlugQuery) => ReactNode;
}

export default async function MenuServer({ children }: ServerMenuProps) {
  "use server";
  let leftNavLinks, rightNavLinks;
  try {
    leftNavLinks = await executeGraphQL<MenuGetBySlugQuery, MenuGetBySlugQueryVariables>(
      MenuGetBySlugDocument,
      {
        variables: { slug: "navbar", ...defaultRegionQuery() },
        revalidate: 60 * 60,
      },
    );

    const { categories } = await executeGraphQL<
      CategoriesSortedByQuery,
      CategoriesSortedByQueryVariables
    >(CategoriesSortedByDocument, {
      variables: { sortBy: { direction: "ASC", field: "PRODUCT_COUNT" }, ...defaultRegionQuery() },
      revalidate: 60 * 60,
      withAuth: false,
    });
    const categoriesId = categories ? mapEdgesToItems(categories) : [];

    const outOfStockCategs = categoriesId
      .filter((category) => category.level > 0 && category.products?.totalCount === 0)
      .map((category) => category.id);

    function filterMenuItems(items: any[]): any[] {
      if (!items || !items.length) return [];

      return items.filter((item) => {
        // Check if the item has a category and if it's out of stock
        const isOutOfStock =
          item.category && item.category.id && outOfStockCategs.includes(item.category.id);

        // If the item is out of stock, exclude it
        if (isOutOfStock) {
          return false;
        }
        // If the item has children, filter them recursively
        if (item.children && item.children.length > 0) {
          item.children = filterMenuItems(item.children); // Recursively filter children
        }
        // Keep the item if it has no category or if it's not out of stock
        return !item.category || !item.category.id || !isOutOfStock;
      });
    }

    // Apply filtering to menu items
    if (leftNavLinks.menu?.items) {
      const filteredItems = filterMenuItems(leftNavLinks.menu.items);
      leftNavLinks = {
        ...leftNavLinks,
        menu: {
          ...leftNavLinks.menu,
          items: filteredItems,
        },
      };
    }
  } catch {
    return [];
  }

  try {
    rightNavLinks = await executeGraphQL<MenuGetBySlugQuery, MenuGetBySlugQueryVariables>(
      MenuGetBySlugDocument,
      {
        variables: { slug: "navbar-right", ...defaultRegionQuery() },
        revalidate: 60 * 60,
      },
    );
  } catch {
    return [];
  }

  return <>{children(leftNavLinks, rightNavLinks)}</>;
}

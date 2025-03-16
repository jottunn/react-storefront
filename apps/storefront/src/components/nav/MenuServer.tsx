import { executeGraphQL } from "src/lib/graphql";
import {
  MenuGetBySlugDocument,
  MenuGetBySlugQuery,
  MenuGetBySlugQueryVariables,
} from "@/saleor/api";
import { ReactNode } from "react";
import { defaultRegionQuery } from "@/lib/regions";
import { getProductsData } from "src/app/actions";

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

    // Get products data
    const productsData = await getProductsData();

    // Create a Set of category IDs from products
    const categoryIds = new Set<string>();

    // Extract all category IDs from products
    productsData.edges.forEach((edge: any) => {
      const product = edge.node;
      if (product.category && product.category.id) {
        categoryIds.add(product.category.id);
      }
      // Add ancestor categories
      if (product.category.ancestors && Array.isArray(product.category.ancestors)) {
        product.category.ancestors.forEach((ancestor: any) => {
          if (ancestor && ancestor.id) {
            categoryIds.add(ancestor.id);
          }
        });
      }
    });

    // Simple recursive function to filter menu items
    function filterMenuItems(items: any[]): any[] {
      if (!items || !items.length) return [];

      return items.filter((item) => {
        // Keep if not a category or if category exists in products
        return !item.category || !item.category.id || categoryIds.has(item.category.id);
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

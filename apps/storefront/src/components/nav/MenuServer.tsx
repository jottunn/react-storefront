import { executeGraphQL } from "src/lib/graphql";
import {
  MenuGetBySlugDocument,
  MenuGetBySlugQuery,
  MenuGetBySlugQueryVariables,
  User,
} from "@/saleor/api";
import { ReactNode } from "react";
import { defaultRegionQuery } from "@/lib/regions";

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

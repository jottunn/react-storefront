import { executeGraphQL } from "src/lib/graphql";
import {
  MenuGetBySlugDocument,
  MenuGetBySlugQuery,
  MenuGetBySlugQueryVariables,
} from "@/saleor/api";
import { ReactNode } from "react";
import { defaultRegionQuery } from "@/lib/regions";

interface ServerMenuProps {
  children: (leftNavLinks: MenuGetBySlugQuery, rightNavLinks: MenuGetBySlugQuery) => ReactNode;
}

export default async function MenuServer({ children }: ServerMenuProps) {
  const leftNavLinks = await executeGraphQL<MenuGetBySlugQuery, MenuGetBySlugQueryVariables>(
    MenuGetBySlugDocument,
    {
      variables: { slug: "navbar", ...defaultRegionQuery() },
      revalidate: 60 * 60,
    },
  );

  const rightNavLinks = await executeGraphQL<MenuGetBySlugQuery, MenuGetBySlugQueryVariables>(
    MenuGetBySlugDocument,
    {
      variables: { slug: "navbar-right", ...defaultRegionQuery() },
      revalidate: 60 * 60,
    },
  );

  return <>{children(leftNavLinks, rightNavLinks)}</>;
}

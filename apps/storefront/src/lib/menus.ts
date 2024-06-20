import { MenuItemFragment } from "@/saleor/api";

export const getLinkPath = (item: MenuItemFragment): string => {
  if (item.category) {
    return `/c/${item.category.slug}`;
  }
  if (item.collection) {
    return `/collection/${item.collection.slug}`;
  }

  if (item.page) {
    return `/${item.page.slug}`;
  }
  return "/";
};

export default getLinkPath;

import { pagesPath } from "@/lib/$path";
import { MenuItemFragment } from "@/saleor/api";

export const getLinkPath = (item: MenuItemFragment) => {
  const paths = pagesPath;

  if (item.category) {
    return paths.categories._slug(item.category?.slug).$url();
  }
  if (item.collection) {
    return paths.collections._slug(item.collection?.slug).$url();
  }
  if (item.page) {
    return paths.pages._slug(item.page?.slug).$url();
  }
  return paths.$url();
};

export default getLinkPath;

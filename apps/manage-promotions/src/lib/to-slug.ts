export function titleToSlug(title: string) {
  return title
    .toLowerCase() // convert to lowercase
    .replace(/[^\w\s-]/g, "") // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .trim() // remove leading and trailing whitespace
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // replace multiple hyphens with one hyphen
}

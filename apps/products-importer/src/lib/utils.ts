export function createSlug(str: string): string {
  // Remove diacritics
  const from = "ãàáäâèéêëìíîïòóôöùúûüñçșț";
  const to = "aaaaaeeeeiiiioooouuuuncst";
  const mapping: { [key: string]: string } = {};

  for (let i = 0; i < from.length; i++) {
    mapping[from.charAt(i)] = to.charAt(i);
  }

  // Normalize string, replace diacritics, and convert to lowercase
  const slug = str
    .toLowerCase()
    .split("")
    .map((char) => mapping[char] || char)
    .join("")
    .replace(/[^\w\s-]/g, "") // Remove all non-word chars
    .trim() // Trim spaces at start and end
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-"); // Replace multiple - with single -

  return slug;
}

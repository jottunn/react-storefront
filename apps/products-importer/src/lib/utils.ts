export function createSlug(str: string): string {
  // Remove diacritics
  const from = "ăãàáäâèéêëìíîïòóôöùúûüñçșț";
  const to = "aaaaaaeeeeiiiioooouuuuncst";
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

export function convertDescriereToEditorJS(descriere: string) {
  const paragraphs = descriere.split("\n");
  const blocks = paragraphs.map((p) => ({
    type: "paragraph",
    data: { text: p.trim() },
  }));
  return JSON.stringify({
    time: new Date().getTime(),
    blocks: blocks,
    version: "2.22.2",
  });
}

export function getFileExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex !== -1 ? filename.substring(dotIndex + 1) : "";
}

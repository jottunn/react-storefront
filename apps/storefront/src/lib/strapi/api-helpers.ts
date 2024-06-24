export function getStrapiURL(path = "") {
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${path}`;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }

  // Return the full URL if the media is hosted on an external provider
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  // Otherwise prepend the URL path with the Strapi URL
  return `${process.env.NEXT_PUBLIC_STRAPI_URL}${url}`;
}

export function generateSrcset(image: any) {
  const formats = image.formats;
  const srcset = [];

  if (formats.thumbnail && formats.thumbnail.url) {
    srcset.push(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}${formats.thumbnail.url} ${formats.thumbnail.width}w`,
    );
  }
  if (formats.small && formats.small.url) {
    srcset.push(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}${formats.small.url} ${formats.small.width}w`,
    );
  }
  if (formats.medium && formats.medium.url) {
    srcset.push(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}${formats.medium.url} ${formats.medium.width}w`,
    );
  }
  if (formats.large && formats.large.url) {
    srcset.push(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}${formats.large.url} ${formats.large.width}w`,
    );
  }

  // Add the original image
  srcset.push(`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.url} ${image.width}w`);

  return srcset.join(", ");
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// ADDS DELAY TO SIMULATE SLOW API REMOVE FOR PRODUCTION
export const delay = (time: number) => new Promise((resolve) => setTimeout(() => resolve(1), time));

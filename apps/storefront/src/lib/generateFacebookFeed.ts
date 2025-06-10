import fs from "fs/promises";
import path from "path";
import { mapEdgesToItems } from "@/lib/maps";
import {
  ProductCollectionFeedDocument,
  ProductCollectionFeedQuery,
  ProductFilterInput,
} from "@/saleor/api";
import { ATTR_COLOR_COMMERCIAL_SLUG, GRAPHQL_PAGINATION_LIMIT, STOREFRONT_URL } from "@/lib/const";
import { defaultRegionQuery } from "./regions";
import { executeGraphQL } from "./graphql";
import { GroupedProduct, groupProductsByColor } from "./product";
import edjsHTML from "editorjs-html";
import { checkAndScheduleJob } from "src/app/actions";

type QueryVariables = {
  filter: ProductFilterInput;
  first: any;
  after?: string | null;
};

async function getAllProducts() {
  try {
    const filter: ProductFilterInput = {
      isPublished: true,
    };

    let hasNextPage = true;
    let afterCursor: string | null = null;
    const allProducts: any[] = [];

    while (hasNextPage) {
      const queryVariables: QueryVariables = {
        filter,
        first: GRAPHQL_PAGINATION_LIMIT,
        after: afterCursor,
        ...defaultRegionQuery(),
      };

      const { products } = await executeGraphQL<ProductCollectionFeedQuery, { filter: any }>(
        ProductCollectionFeedDocument,
        {
          variables: queryVariables,
          withAuth: false,
        },
      );
      if (!products || !products.edges.length) {
        break;
      }

      allProducts.push(...products.edges);
      hasNextPage = products.pageInfo.hasNextPage;
      afterCursor = products.pageInfo.endCursor ?? null;
    }

    return mapEdgesToItems({ edges: allProducts }) as GroupedProduct[];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

function stripHtml(html: string): string {
  // First decode HTML entities
  const decoded = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z0-9]+;/gi, " "); // Replace any other HTML entities with space

  // Then remove HTML tags and clean up spaces
  return decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateFacebookFeedCSV(products: any) {
  const edjsParser = edjsHTML();

  // CSV Header
  const headers = [
    "id",
    "title",
    "description", //max 9999
    "link",
    "image_link",
    "availability", //in stock, out of stock
    "price", //period, no comma
    "sale_price",
    "fb_product_category",
    "google_product_category",
    "brand",
    "condition",
    "age_group", //adult, kids
    "gender", //female, male, unisex.
  ].join(",");

  const feedProducts = groupProductsByColor(products, true);
  const rows = feedProducts.map((product: any) => {
    //group variants by color -> each gets a row in final csv
    const checkProductVariant = product.variants?.filter(
      (variant: { quantityAvailable: number | null }) =>
        variant.quantityAvailable != null && variant.quantityAvailable > 0,
    );
    let variant = product.variants?.[0];
    let availability = "in stock";
    if (checkProductVariant && checkProductVariant.length > 0) {
      variant = checkProductVariant?.[0];
    } else {
      availability = "out of stock";
    }
    const colorVariant = variant?.attributes.find(
      (attr: { attribute: { slug: string } }) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
    );
    const colorValue = colorVariant?.values[0]?.["name"] || "";
    const sku = variant?.sku;
    const link = `${STOREFRONT_URL}/p/${product.slug}${colorValue ? `--${colorValue}` : ""}`;
    let title = `${product.name}${colorValue ? ` - ${colorValue}` : ""}`;

    // Ensure title is under 200 characters
    if (title.length > 200) {
      // If adding color makes it too long, just use the product name
      if (product.name.length <= 200) {
        title = product.name;
      } else {
        // If product name itself is too long, truncate it
        title = product.name.substring(0, 195) + "...";
      }
    }
    //ensure the description is under 9999
    let description = product.description
      ? stripHtml(edjsParser.parse(JSON.parse(product.description)).join(""))
      : "";
    if (description.length >= 9999) {
      description = description.substring(0, 9000) + "...";
    }

    const price = product.pricing.onSale
      ? product.pricing.priceRangeUndiscounted.start.gross.amount
      : product.pricing.priceRange.start.gross.amount + " RON";
    const sale_price = product.pricing.onSale
      ? product.pricing.priceRange.start.gross.amount + " RON"
      : "";
    const brand = product.attributes.find(
      (attribute: { attribute: { slug: string } }) => attribute.attribute.slug === "brand",
    );

    const genderAttr = product.attributes.find(
      (attribute: { attribute: { slug: string } }) => attribute.attribute.slug === "gen",
    );
    const gender = genderAttr?.values?.[0]?.["name"] || "unisex";

    let imageUrl;
    if (variant && variant.media && variant.media.length > 0) {
      //sort media by sortOrder
      const sortedMedia = variant.media
        .filter((item: { type: string }) => item.type !== "VIDEO")
        .sort((a: { sortOrder: number }, b: { sortOrder: number }) => {
          if (typeof a.sortOrder === "number" && typeof b.sortOrder === "number") {
            return a.sortOrder - b.sortOrder;
          }
          return 30;
        });

      if (sortedMedia && sortedMedia.length > 0) {
        imageUrl = sortedMedia[0].url;
      }
    }
    if (!imageUrl) {
      imageUrl = product.media?.[0]?.url ? product.media?.[0]?.url : product.thumbnail?.url;
    }
    // Escape fields that might contain commas or quotes
    const escapeCSV = (field: any) => {
      // Convert field to string and handle null/undefined
      const stringField = field?.toString() || "";
      if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const category: string = product.category.slug;
    const categoryFbMap: { [key: string]: number } = {
      biciclete: 2701,
      "biciclete-mtb-hardtailcross-country": 2701,
      "biciclete-mtb-full-suspension": 2701,
      "biciclete-gravel": 2701,
      "biciclete-electrice": 2701,
      "biciclete-hibrid": 2701,
      "biciclete-urbane": 2701,
      "biciclete-sosea": 2701,
      piese: 2649,
      cauciucurianvelope: 2686,
      camere: 2691,
      pedale: 2665,
      "mansoane-si-ghidolina": 2670,
      pipe: 2671,
      "sei-si-tije": 2677,
      ghidoane: 2671,
      frane: 2650,
      lanturi: 2661,
      schimbatoare: 2662,
      "angrenaje-butuci-pinioane": 2662,
      echipament: 2702,
      "tricouri-ciclism": 2702,
      "bluze-si-hanorace": 2702,
      geci: 2702,
      "pantaloni-lungi": 2703,
      "pantaloni-scurti": 2705,
      "pantaloni-cu-bazon-pentru-ciclism": 2707,
      manusi: 2714,
      "echipament-protectie": 2716,
      casti: 2715,
      incaltaminte: 2713,
      sosete: 2702,
      "rucsacuri-genti-si-borsete": 2636,
      "accesorii-echipament": 2702,
      accesorii: 2622,
      lumini: 2632,
      antifurt: 2633,
      "bidoane-si-suporturi-bidoane": 2646,
      "aparatori-noroi": 2630,
      "portbagaje-si-cricuri": 2631,
      "suporturi-auto": 2645,
      pompe: 2635,
      vitezometre: 2628,
      "produse-intretinere": 2649,
      scule: 2641,
    };

    const categoryGoogleMap: { [key: string]: number } = {
      biciclete: 1026,
      "biciclete-mtb-hardtailcross-country": 1026,
      "biciclete-mtb-full-suspension": 1026,
      "biciclete-gravel": 1026,
      "biciclete-electrice": 1026,
      "biciclete-hibrid": 1026,
      "biciclete-urbane": 1026,
      "biciclete-sosea": 1026,
      piese: 3618,
      cauciucurianvelope: 3618,
      camere: 3618,
      pedale: 3618,
      "mansoane-si-ghidolina": 3618,
      pipe: 3618,
      "sei-si-tije": 3618,
      ghidoane: 3618,
      frane: 3618,
      lanturi: 3618,
      schimbatoare: 3618,
      "angrenaje-butuci-pinioane": 3618,
      echipament: 3982,
      "tricouri-ciclism": 3982,
      "bluze-si-hanorace": 3982,
      geci: 3982,
      "pantaloni-lungi": 3982,
      "pantaloni-scurti": 3982,
      "pantaloni-cu-bazon-pentru-ciclism": 3982,
      manusi: 3982,
      "echipament-protectie": 8061,
      casti: 3982,
      incaltaminte: 3982,
      sosete: 3982,
      "rucsacuri-genti-si-borsete": 3982,
      "accesorii-echipament": 3982,
      accesorii: 3214,
      lumini: 3214,
      antifurt: 3214,
      "bidoane-si-suporturi-bidoane": 3214,
      "aparatori-noroi": 3214,
      "portbagaje-si-cricuri": 3214,
      "suporturi-auto": 3214,
      pompe: 3214,
      vitezometre: 3214,
      "produse-intretinere": 3214,
      scule: 3214,
    };

    return [
      escapeCSV(variant?.sku || product.id),
      escapeCSV(title),
      escapeCSV(description),
      escapeCSV(link),
      escapeCSV(imageUrl),
      availability,
      escapeCSV(price),
      escapeCSV(sale_price),
      categoryFbMap[category] || 2701,
      categoryGoogleMap[category] || 1026,
      brand?.values?.[0]?.["name"] || "Surmont",
      "new",
      gender === "copii" ? "kids" : "adult",
      gender === "femei" ? "female" : gender === "barbati" ? "male" : "unisex",
    ].join(",");
  });

  return [headers, ...rows].join("\n");
}

async function scheduleJob() {
  const Bull = require("bull");
  const generateFacebookFeedQueue = new Bull("generateFacebookFeedQueue", {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    },
  });
  // Define the processor
  generateFacebookFeedQueue.process(async () => {
    try {
      //console.log('Starting scheduled products generation');
      await generateAndSaveFacebookFeedCSVFile();
      console.log("Scheduled facebookfeed created successfully");
      return { status: "success" };
    } catch (error) {
      console.error("Error in scheduled facebookfeed generation:", error);
      throw error;
    }
  });
  //check for scheduled jobs, if none than schedule
  await checkAndScheduleJob(generateFacebookFeedQueue, "0 6 * * *");
}

export async function generateAndSaveFacebookFeedCSVFile() {
  console.log("Starting Facebook feed CSV generation and saving process...");
  try {
    const products = await getAllProducts();
    const csvContent = generateFacebookFeedCSV(products);

    // Define the path to the public folder
    const publicFolderPath = path.join(process.cwd(), "public/generated");
    const filePath = path.join(publicFolderPath, "facebook_feed.csv");

    try {
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        console.log("CSV file is empty, running scheduleJob()");
        await scheduleJob();
      } else {
        console.log("CSV file is not empty, skipping scheduleJob()");
      }
    } catch (err) {
      console.log("error in checking csv file content");
    }

    // Ensure the public directory exists (though Next.js usually creates it)
    await fs.mkdir(publicFolderPath, { recursive: true });
    await fs.writeFile(filePath, csvContent, "utf8");

    console.log(`Facebook feed CSV generated and saved successfully to: ${filePath}`);
  } catch (error) {
    console.error("Failed to generate or save Facebook feed CSV:", error);
    // Re-throw the error so the calling API route can catch it and return an error response
    throw error;
  }
}

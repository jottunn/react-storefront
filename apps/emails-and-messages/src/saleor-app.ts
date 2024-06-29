import { APL, FileAPL, SaleorCloudAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import MyAPL from "shared-apl";

export let apl: APL;
const volumeConfig = {
  fileName: "/app/apps/emails-and-messages/.saleor-app-auth.json",
};
try {
  switch (process.env.APL) {
    case "upstash":
      apl = new UpstashAPL();
      console.log("Using UpstashAPL");
      break;
    case "volume":
      apl = new MyAPL(volumeConfig);
      console.log("Using MyAPL with volumeConfig:", volumeConfig);
      break;
    case "saleor-cloud": {
      if (!process.env.REST_APL_ENDPOINT || !process.env.REST_APL_TOKEN) {
        throw new Error("Rest APL is not configured - missing env variables. Check saleor-app.ts");
      }
      apl = new SaleorCloudAPL({
        resourceUrl: process.env.REST_APL_ENDPOINT,
        token: process.env.REST_APL_TOKEN,
      });
      console.log("Using SaleorCloudAPL with REST_APL_ENDPOINT:", process.env.REST_APL_ENDPOINT);
      break;
    }
    default: {
      console.log("Using FileAPL");
      apl = new FileAPL();
    }
  }
} catch (error) {
  console.error("Error initializing APL:", error);
  throw error; // Re-throw the error after logging it
}
export const saleorApp = new SaleorApp({
  apl,
});

export const REQUIRED_SALEOR_VERSION = ">=3.11.7 <4";

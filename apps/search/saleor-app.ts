import { APL, FileAPL, UpstashAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import MyAPL from "shared-apl";
/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */
const aplType = process.env.APL ?? "file";
let apl: APL;

const volumeConfig = {
  fileName: "/app/apps/search/.saleor-app-auth.json",
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

if (!process.env.SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "For production deployment SECRET_KEY is mandatory to use EncryptedSettingsManager.",
  );
}

// Use placeholder value for the development
export const settingsManagerSecretKey = process.env.SECRET_KEY || "CHANGE_ME";

export const saleorApp = new SaleorApp({
  apl,
});

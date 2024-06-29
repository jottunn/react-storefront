import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { APL, FileAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import MyAPL from "shared-apl";
/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */
export let apl: APL;
const volumeConfig = {
  fileName: "/app/apps/products-importer/.saleor-app-auth.json",
};
switch (process.env.APL) {
  case "upstash":
    // Require `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables
    apl = new UpstashAPL();
    break;
  case "volume":
    apl = new MyAPL(volumeConfig);
    break;
  default:
    apl = new FileAPL();
}

export const saleorApp = new SaleorApp({
  apl,
});

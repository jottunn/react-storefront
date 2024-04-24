import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import { useRouter } from "next/router";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/importer");
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  return (
    <div>
      <h1>Saleor Products Importer</h1>
      <p>
        This is Saleor App that allows importing data from CSV and assigning media to products and
        variants
      </p>
    </div>
  );
};

export default IndexPage;

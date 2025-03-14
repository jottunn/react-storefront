import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useIsMounted } from "usehooks-ts";
import Link from "next/link";
import { Button } from "@saleor/macaw-ui";

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();

  return (
    <>
      <div>
        <h1>Products Importer</h1>
        {isMounted() && appBridgeState?.ready && (
          <Link href="/importer">
            <Button variant="primary">Go to Import</Button>
          </Link>
        )}
      </div>
    </>
  );
};

export default IndexPage;

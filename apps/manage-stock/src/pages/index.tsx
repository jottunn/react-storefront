import { useEffect, useState } from "react";
import { NextPage } from "next";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import Link from "next/link";

const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box padding={8} display={"flex"} flexDirection={"column"} gap={6} __maxWidth={"640px"}>
      <Text size={"medium"}>🚀 Manage Stocks - Auto Sync with Expert</Text>
      {appBridgeState?.ready && mounted && (
        <>
          <div
            style={{ display: "block", width: "100%", border: "1px solid #ddd", padding: "5px" }}
          >
            <Text as={"p"} style={{ marginBottom: "5px" }}>
              {" "}
              Log entries for all updates that were sent by Expert
            </Text>
            <Link href="/logs">
              <Button variant="primary">View log</Button>
            </Link>
          </div>
          {/* <div
            style={{ display: "block", width: "100%", border: "1px solid #ddd", padding: "5px" }}
          >
            <Text as={"p"} style={{ marginBottom: "5px" }}>
              {" "}
              Check & Update stock for all products
            </Text>
            <Link href="/sync">
              <Button variant="primary">Go to Sync</Button>
            </Link>
          </div> */}
        </>
      )}
    </Box>
  );
};

export default IndexPage;

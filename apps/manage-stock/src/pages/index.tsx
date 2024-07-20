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
      <Text size={"medium"}>Manage Stocks - Auto Sync with Expert</Text>
      <Text as={"p"}>🚀 Stocks are updated from Expert</Text>
      {appBridgeState?.ready && mounted && (
        <Link href="/logs">
          <Button variant="primary" style={{ marginRight: "40px" }}>
            View log
          </Button>
        </Link>
      )}
      {/* {appBridgeState?.ready && mounted && <SyncChanges />} */}
    </Box>
  );
};

export default IndexPage;

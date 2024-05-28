import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useEffect, useState } from "react";

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
      {/* {appBridgeState?.ready && mounted && <SyncChanges />} */}
    </Box>
  );
};

export default IndexPage;

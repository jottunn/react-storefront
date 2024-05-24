import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { SyncChanges } from "../sync-changes";

const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box padding={8} display={"flex"} flexDirection={"column"} gap={6} __maxWidth={"640px"}>
      <Text size={"medium"}>Manage Collections for Promotions</Text>
      <Text as={"p"} marginY={2}>
        💡 For each promotion created in Discounts, a collection will be automatically generated and
        synchronized with all changes made to that discount, including removal.
      </Text>
      <Text as={"p"}>
        🚀 If you encounter any issues, you can resynchronize all collections associated with
        promotions
      </Text>
      {appBridgeState?.ready && mounted && <SyncChanges />}
    </Box>
  );
};

export default IndexPage;

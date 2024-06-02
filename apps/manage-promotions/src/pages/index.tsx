import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { SyncChanges } from "../sync-changes";
import { UpdateRules } from "../update-rules";
import Link from "next/link";

const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Box padding={8} display={"flex"} flexDirection={"column"} gap={6} __maxWidth={"640px"}>
        <Text variant="heading">Manage Collections for Promotions</Text>
        <Text as={"p"} marginY={2}>
          💡 For each promotion created in Discounts, a collection will be automatically generated
          and synchronized with all changes made to that discount, including removal.
        </Text>
        <Text as={"p"}>
          🚀 If you encounter any issues, you can resynchronize all collections associated with
          promotions
        </Text>
        <Box display={"flex"} marginY={4}>
          {appBridgeState?.ready && mounted && <SyncChanges />}
          {appBridgeState?.ready && mounted && (
            <Link href="/actions">
              <Button variant="primary">Update rules</Button>
            </Link>
          )}
        </Box>
      </Box>
    </>
  );
};

export default IndexPage;

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
      <Text size={"medium"}>🚀 ING Payments</Text>
      {appBridgeState?.ready && mounted && (
        <>
          <div
            style={{ display: "block", width: "100%", border: "1px solid #ddd", padding: "5px" }}
          >
            <Text as={"p"} style={{ marginBottom: "5px" }}>
              {" "}
              Log entries for all online payments
            </Text>
            <Link href="/logs">
              <Button variant="primary">View log</Button>
            </Link>
          </div>
          <div
            style={{ display: "block", width: "100%", border: "1px solid #ddd", padding: "5px" }}
          >
            <Text as={"p"} style={{ marginBottom: "5px" }}>
              {" "}
              View abandoned carts (went to payment console and return without paying)
            </Text>
            <Link href="/abandoned-carts">
              <Button variant="primary">View entries</Button>
            </Link>
          </div>
        </>
      )}
    </Box>
  );
};

export default IndexPage;

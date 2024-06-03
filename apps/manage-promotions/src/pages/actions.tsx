import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { UpdateRules } from "../update-rules";
import Link from "next/link";

const ActionsPage = () => {
  return (
    <Box padding={8} display={"flex"} flexDirection={"column"} gap={6}>
      <Link href="/">
        <Button variant="secondary">Back</Button>
      </Link>
      <UpdateRules />
    </Box>
  );
};

export default ActionsPage;

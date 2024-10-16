import { useClient } from "urql";
import { Box, Button, List, Spinner, Text } from "@saleor/macaw-ui";
import { sync } from "./modules/sync/sync";
import { useState } from "react";

export const SyncChanges = () => {
  const client = useClient();
  const [result, setResult] = useState([""]);
  const [loading, setLoading] = useState(false);

  const syncAll = async () => {
    setLoading(true);
    const response = await sync(client);
    if (response) {
      setResult(response);
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Button variant={"secondary"} onClick={() => syncAll()}>
          Resync all Collections
        </Button>
      )}

      {result && result.length > 0 && (
        <Box display={"block"}>
          <List>
            {result.map((msg, index) => (
              <List.Item borderRadius={3} gap={3} paddingX={2} paddingY={2} key={index}>
                <Text color={"textBrandDefault"}>{msg}</Text>
              </List.Item>
            ))}
          </List>
        </Box>
      )}
    </>
  );
};

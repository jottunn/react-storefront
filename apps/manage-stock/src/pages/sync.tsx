import Link from "next/link";
import { useClient } from "urql";
import { Box, Button, List, Spinner, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { syncStock } from "../modules/sync-stock";

const SyncPage = () => {
  const client = useClient();
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [codStoc, setCodStoc] = useState("");

  const syncStoc = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await syncStock(client, codStoc); // Call the syncStock function
      if (response) {
        if (Array.isArray(response)) {
          setResult(response); // Set the result if the response is an array
        } else if (response.messages) {
          setResult(response.messages); // Set the result if the response contains messages
        }
      }
    } catch (error) {
      console.error("Error during sync:", error);
      setResult(["Error during synchronization."]); // Handle errors
    } finally {
      setLoading(false); // Set loading state to false
      setCodStoc(""); // Reset the input field
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Link href="/">
        <Button variant="secondary">Back</Button>
      </Link>
      <hr />
      <h1>Surmont ➛ Expert 🔹 sync</h1>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <label htmlFor="codstoc">
            Enter cod stoc or leave empty to schedule the resync for all products
          </label>
          <br />
          <input
            type="text"
            placeholder="cod stoc"
            id="codstoc"
            value={codStoc}
            onChange={(e) => setCodStoc(e.target.value)}
            style={{ padding: "10px", margin: "10px" }}
          />
          <br />
          <Button variant={"primary"} onClick={syncStoc}>
            Sync stoc with Expert
          </Button>
        </>
      )}
      {result && result.length > 0 && (
        <Box display={"block"} marginTop={4}>
          <List>
            {result.map((msg, index) => (
              <List.Item borderRadius={3} gap={3} paddingX={2} paddingY={2} key={index}>
                <Text color={msg.startsWith("Error") ? "textCriticalDefault" : "textBrandDefault"}>
                  {msg}
                </Text>
              </List.Item>
            ))}
          </List>
        </Box>
      )}
    </div>
  );
};

export default SyncPage;

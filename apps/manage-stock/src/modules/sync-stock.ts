import { Client } from "urql";
import { handleStockUpdate } from "./handle-sync-stock-update";

export const syncStock = async (client: Client, codStoc?: string) => {
  const messages: string[] = [];
  if (codStoc && codStoc !== "") {
    return await handleStockUpdate(client, codStoc);
  } else {
    const schedule = await fetch("/api/syncStockQueue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client }),
    }).catch((err) => {
      messages.push("Failed to schedule stock update in queue");
      console.error("Failed to schedule stock update in queue:", err);
    });

    if (schedule && schedule.ok) {
      const response = await schedule.json(); // Parse the JSON response
      // console.log('response.message', response.message);
      messages.push(response.message); // Return the message from the response
    } else {
      messages.push(
        "Failed to schedule stock update: " + (schedule?.statusText || "Unknown error")
      );
      // Return the error messages
    }
    return { messages };
  }
};

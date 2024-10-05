import { processTransaction } from "../actions";

//Function to call the API and return the response message

export const callPaymentAppApi = async (checkoutId: string) => {
  try {
    const response = await processTransaction(checkoutId);
    console.log("responseProcess - callPaymentAppApi", response);
    return response;
  } catch (err) {
    console.error("Failed to process payment11:", err);
    return { error: "Failed to process payment, retry later (not available)" };
  }
};

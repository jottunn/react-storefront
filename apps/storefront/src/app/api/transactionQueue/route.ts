import { NextRequest, NextResponse } from "next/server";
import Bull from "bull";
import { checkTransactionStatus } from "@/components/checkout/actions";
import { callPaymentAppApi } from "@/components/checkout/payments/callPaymentApi";

// Set up the queue
const transactionQueue = new Bull("transactionQueue", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep only the latest 10 completed jobs
    removeOnFail: 10, // Keep only the latest 10 failed jobs
  },
});

// Define the process for handling jobs in the queue
transactionQueue.process(async (job) => {
  const { transactionId } = job.data;

  try {
    const response = await checkTransactionStatus(transactionId);
    const transaction = response.data.message;
    console.log("checkTransactionStatusResponseMessage", transaction);
    // Check if the transaction has success or failure events
    const hasAuthReq = transaction.events?.filter(
      (ev: { type: string }) => ev.type === "AUTHORIZATION_ACTION_REQUIRED",
    );

    if (hasAuthReq.length && transaction.pspReference && !transaction.order?.id) {
      console.log(`Transaction not completed for ${transactionId}, start processing...`);
      const responseMessage = await callPaymentAppApi(transaction.checkout.id);
      console.log("Payment processed:", responseMessage);
    } else {
      console.log(`Transaction has been successfully completed for ${transactionId}`);
    }
    return { status: "success", transactionId };
  } catch (error) {
    console.error("Error processing transaction storefront-checkTransactionStatus:", error);
    throw error; // Let Bull handle retries or failure
  }
});

// Handler for adding a new task to the queue
export async function POST(request: NextRequest) {
  const { transactionId } = await request.json();

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
  }

  try {
    // Add the task to the queue with a 10-minute delay
    await transactionQueue.add({ transactionId }, { delay: 600000 });
    return NextResponse.json({ message: "Transaction added to the queue for processing" });
  } catch (error) {
    console.error("Error adding task to the queue:", error);
    return NextResponse.json({ error: "Failed to add task to the queue" }, { status: 500 });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import Bull from "bull";
import { handleStockUpdate } from "../../modules/handle-sync-stock-update";
import { saleorApp } from "../../saleor-app";
import { createClient } from "../../lib/create-graphq-client";
import logger from "../../logger";

const checkAndScheduleJob = async (queue: Bull.Queue) => {
  try {
    // Get all repeat jobs
    const repeatableJobs = await queue.getRepeatableJobs();
    console.log("Existing repeatable jobs:", repeatableJobs);

    // Check if our specific job already exists
    const existingJob = repeatableJobs.find((job: { cron: string }) => job.cron === "0 2 * * 0");

    if (existingJob) {
      console.log("Job already scheduled:", existingJob);
      return;
    }
    // Schedule new job only if none exists
    const job = await queue.add(
      {},
      {
        repeat: {
          cron: "0 2 * * 0",
        },
        removeOnComplete: false,
      }
    );
    console.log("Stoc sync scheduled for every Sunday at 2am, job ID:", job.id);
  } catch (error) {
    console.error("Error checking/scheduling job:", error);
  }
};

const stockUpdateQueue = new Bull("stockUpdateQueue", {
  redis: {
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  },
});
const oneTimeQueue = new Bull("stockUpdateQueue", {
  redis: {
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  },
});

// Define the process for handling jobs in the queue
stockUpdateQueue.process(async () => {
  try {
    const authData = await saleorApp.apl.getAll();
    const client = createClient(authData[0]["saleorApiUrl"], async () => ({
      token: authData[0]["token"],
    }));
    await handleStockUpdate(client);
    logger.info("handleStockUpdate - all products - job done");

    return { status: "success" };
  } catch (error) {
    logger.error(`Job failed with error: ${error.message}`);
    throw error; // Ensure the error is thrown so Bull can handle it
  }
});

stockUpdateQueue.on("failed", (job, err) => {
  console.error(`Job failed with error: ${err.message}`);
});

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Schedule full product stock update job to run after 1 minute
    await oneTimeQueue.add({}, { delay: 60000, removeOnComplete: true });
    //schedule a weekly job, sunday at 2am, if no schedule ecists
    await checkAndScheduleJob(stockUpdateQueue);
    res.status(200).json({ message: "All products stock update scheduled in 1 minute." });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

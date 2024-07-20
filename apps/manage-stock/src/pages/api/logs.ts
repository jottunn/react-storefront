import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const logFilePath = path.resolve(process.cwd(), "logs/app.log");

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = fs.readFileSync(logFilePath, "utf8");
    res.status(200).json({ logs: data.split("\n") });
  } catch (error) {
    res.status(500).json({ error: "Failed to read log file" });
  }
};

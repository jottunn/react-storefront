import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const expertURL = process.env.NEXT_PUBLIC_ERP_EXPERT_GET_STOC_API_URL;
  const secretKey = process.env.NEXT_PUBLIC_ERP_EXPERT_SECRET_KEY;
  const { articolCod } = req.query;

  if (!articolCod) {
    res.status(400).json({ error: "ArticolCod is required" });
    return;
  }

  const url = `${expertURL}?ArticolCod=${articolCod}&secretkey=${secretKey}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching stock: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching stock from Expert:", error);
    res.status(500).json({ error: "Failed to fetch stock" });
  }
}

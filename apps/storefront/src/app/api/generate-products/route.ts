// app/api/generate-products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateProductsJson } from "@/lib/generateProductsJson"; // Adjust the import path as necessary
import { notFound } from "next/navigation";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // Check if the token is valid
  if (token !== process.env.GENERATE_PRODUCTS_TOKEN) {
    return notFound();
  }
  try {
    await generateProductsJson();
    return NextResponse.json({ message: "Products JSON generated successfully" });
  } catch (error) {
    console.error("Failed to generate products JSON:", error);
    return NextResponse.json({ error: "Failed to generate products JSON" }, { status: 500 });
  }
}

// app/api/generate-products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { generateFilterIndex } from "@/lib/generateFilterIndexJson";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // Check if the token is valid
  if (token !== process.env.GENERATE_PRODUCTS_TOKEN) {
    return notFound();
  }
  try {
    await generateFilterIndex();
    return NextResponse.json({ message: "Filters JSON generated successfully" });
  } catch (error) {
    console.error("Failed to generate filters JSON:", error);
    return NextResponse.json({ error: "Failed to generate products JSON" }, { status: 500 });
  }
}

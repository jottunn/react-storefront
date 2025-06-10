import { NextRequest, NextResponse } from "next/server";
import { generateAndSaveFacebookFeedCSVFile } from "@/lib/generateFacebookFeed";
import { notFound } from "next/navigation";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  // Check if the token is valid
  if (token !== process.env.GENERATE_PRODUCTS_TOKEN) {
    return notFound();
  }
  try {
    await generateAndSaveFacebookFeedCSVFile();
    return NextResponse.json({ message: "Products Feed generated successfully" });
  } catch (error) {
    console.error("Failed to generate products feed:", error);
    return NextResponse.json({ error: "Failed to generate products feed" }, { status: 500 });
  }
}

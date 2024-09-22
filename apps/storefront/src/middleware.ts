import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create an in-memory store for IP requests (rate limiting for invalid slugs)
const rateLimitStore: Record<string, { count: number; lastRequest: number }> = {};

const RATE_LIMIT = 10; // Max 10 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const ip = req.ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  // Skip rate limiting and slug validation for static assets (like images, CSS, JS, etc.)
  const staticAssetPattern = /\.(css|js|png|jpg|jpeg|gif|svg|ico|map|woff|woff2|ttf)$/i;
  if (staticAssetPattern.test(url.pathname)) {
    return NextResponse.next(); // Skip static assets
  }

  // Slug validation for common invalid requests
  const invalidPatterns = [
    /^\./, // No dot-prefixed files
    /\.(env|example|json|js|ts|tsx|md|html|css|scss|png|php|php5|jpg|jpeg|gif|git|svg|ico|map|world|txt|yaml|bak|prod|production|log|backup)$/, // Block specific file types
    /cgi-bin|luci|admin|cdn-cgi|phpsysinfo|php-cgi/, // Block common bot slugs
  ];

  const isInvalid = invalidPatterns.some((pattern) => pattern.test(url.pathname));

  // If the slug matches an invalid pattern, apply rate limiting
  if (isInvalid) {
    console.warn(`Invalid request for slug: ${url.pathname} from IP: ${ip}`);

    // Simple rate limit logic for invalid slugs
    const now = Date.now();
    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = { count: 1, lastRequest: now };
    } else {
      const timeSinceLastRequest = now - rateLimitStore[ip].lastRequest;
      if (timeSinceLastRequest > RATE_LIMIT_WINDOW) {
        rateLimitStore[ip].count = 1;
        rateLimitStore[ip].lastRequest = now;
      } else {
        rateLimitStore[ip].count += 1;
      }
    }

    // Check rate limit
    if (rateLimitStore[ip].count > RATE_LIMIT) {
      console.warn(`Rate limit exceeded for IP: ${ip} at ${new Date().toISOString()}`);
      return new NextResponse("Too many requests, please try again later.", { status: 429 });
    }

    const response = new NextResponse("Not Found", { status: 404 });
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
    );
    return response;
  }

  // Allow valid requests to proceed
  return NextResponse.next();
}

// Matcher configuration for dynamic routes
export const config = {
  matcher: "/:slug*", // Match all dynamic slug routes
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create an in-memory store for IP requests (rate limiting for invalid slugs)
const rateLimitStore: Record<string, { count: number; lastRequest: number }> = {};

const RATE_LIMIT = 3; // Max 2 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Handle locale redirects
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const ip = req.ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  // Get the user-agent from the request headers
  const userAgent = req.headers.get("user-agent") || "";
  const searchEngineBots = [
    "Googlebot",
    "Bingbot",
    "Yahoo! Slurp",
    "DuckDuckBot",
    "Baiduspider",
    "Sogou",
    "Exabot",
  ];
  // List of known bot keywords to detect
  const botKeywords = [
    "bot",
    "crawl",
    "slurp",
    "spider",
    "MJ12bot",
    "AhrefsBot",
    "SEMrushBot",
    "DotBot",
    "BLEXBot",
    "linkdexbot",
    "Yodaobot",
    "MegaIndex.ru",
    "ZoominfoBot",
    "archive.org_bot",
    "Magpie-Crawler",
    "Teoma",
    "SistrixBot",
    "oBot",
    "CareerBot",
    "SurveyBot",
    "AspiegelBot",
    "Gigablast",
    "CensysInspect",
    "SiteAuditBot",
    "Bytespider",
    "LinkpadBot",
    "PhantomJS",
    "Slack-ImgProxy",
    "Twingly",
    "Tupalo",
    "webmeup-crawler",
    "YisouSpider",
    "GarlikCrawler",
    "StackRambler",
    "WeSEE",
    "SiteExplorer",
    "Wotbox",
    "UptimeRobot",
    "Pingdom",
    "CensysInspect",
    "AspiegelBot",
  ];

  // Check if the User-Agent string contains any bot keyword
  if (
    botKeywords.some((keyword) => userAgent.toLowerCase().includes(keyword.toLowerCase())) &&
    !searchEngineBots.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()))
  ) {
    console.log("Malicious Bot detected:", userAgent);
    // If it's a bot, respond without performing any sensitive actions
    return new NextResponse("Bot detected, no action taken", { status: 200 });
  }

  // Skip rate limiting and slug validation for static assets (like images, CSS, JS, etc.)
  const staticAssetPattern = /\.(css|js|png|jpg|jpeg|gif|svg|ico|map|woff|woff2|ttf)$/i;
  if (staticAssetPattern.test(url.pathname)) {
    return NextResponse.next(); // Skip static assets
  }

  // Allow sitemap.xml to pass through
  if (url.pathname === "/sitemap.xml") {
    return NextResponse.next();
  }

  // Slug validation for common invalid requests
  const invalidPatterns = [
    /^\./, // No dot-prefixed files
    /\.(env|example|json|js|jsp|ts|tsx|md|html|css|scss|png|php|php5|jpg|jpeg|gif|git|svg|ico|map|world|txt|yaml|bak|prod|production|log|backup|xml)$/, // Block specific file types
    /cgi-bin|luci|admin|cdn-cgi|phpsysinfo|php-cgi|actuator|health|git/, // Block common bot slugs
  ];

  const isInvalid = invalidPatterns.some((pattern) => pattern.test(url.pathname));
  // Check query parameters (e.g., filters[slug])
  const isInvalidQuery = [...url.searchParams.values()].some((value) =>
    invalidPatterns.some((pattern) => pattern.test(String(value))),
  );

  // If the slug matches an invalid pattern, apply rate limiting
  if (isInvalid || isInvalidQuery) {
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

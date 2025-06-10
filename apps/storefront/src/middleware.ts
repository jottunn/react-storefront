import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pre-compiled regex patterns
const staticAssetPattern = new RegExp(
  "\\.(css|js|png|jpg|jpeg|gif|svg|ico|map|woff|woff2|ttf|csv|json)$",
  "i",
);
const invalidPatterns = [
  new RegExp("^\\."),
  new RegExp(
    "\\.(env|example|js|jsp|ts|tsx|md|html|css|scss|png|php|php5|jpg|jpeg|gif|git|svg|ico|map|world|yaml|bak|prod|production|log|backup|xml)$",
  ),
  new RegExp("cgi-bin|luci|cdn-cgi|phpsysinfo|php-cgi|actuator|health|git"),
];

const searchEngineBots = [
  "Googlebot",
  "Bingbot",
  "Yahoo! Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "Sogou",
  "Exabot",
];

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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Skip API routes and static assets
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    staticAssetPattern.test(url.pathname) ||
    url.pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Bot detection
  const userAgent = req.headers.get("user-agent") || "";
  const isBot =
    botKeywords.some((keyword) => userAgent.toLowerCase().includes(keyword.toLowerCase())) &&
    !searchEngineBots.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));

  if (isBot) {
    return new NextResponse("Bot detected", { status: 200 });
  }

  // Invalid path detection
  const isInvalid = invalidPatterns.some((pattern) => pattern.test(url.pathname));

  const isInvalidQuery = [...url.searchParams.values()].some((value) =>
    invalidPatterns.some((pattern) => pattern.test(String(value))),
  );

  if (isInvalid || isInvalidQuery) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files).csv
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:json|csv)$).*)",
  ],
};

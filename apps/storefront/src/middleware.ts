import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Combined regex for invalid patterns
const invalidPattern = new RegExp(
  [
    "^\\.",
    "\\.(env|example|jsp|ts|tsx|md|html|scss|php|php5|git|world|yaml|bak|prod|production|log|backup|xml)$",
    "cgi-bin|luci|cdn-cgi|phpsysinfo|php-cgi|actuator|health|git",
  ].join("|"),
  "i",
);

const staticAssetPattern = /\.(css|js|png|jpg|jpeg|gif|svg|ico|map|woff2?|ttf|csv|json)$/i;

const searchEngineBots = [
  "googlebot",
  "bingbot",
  "yahoo! slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "applebot",
  "sogou",
  "exabot",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "pinterest",
  "whatsapp",
  "slurp",
  "discordbot",
  "slackbot",
  "telegrambot",
  "iframely",
  "embedly",
  "metainspector",
];

const botKeywords = [
  "mj12bot",
  "ahrefsbot",
  "semrushbot",
  "blexbot",
  "linkdexbot",
  "megaindex",
  "zoominfobot",
  "magpie-crawler",
  "sistrix",
  "obot",
  "careerbot",
  "aspiegelbot",
  "bytespider",
  "phantomjs",
  "nmap",
  "sqlmap",
  "nessus",
  "nikto",
  "openvas",
  "metasploit",
  "wget",
  "python-requests",
  "libwww-perl",
  "spambot",
  "scraper",
  "leacher",
  "extractor",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Early skip for static/API routes
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    staticAssetPattern.test(url.pathname) ||
    ["/sitemap.xml", "/robots.txt", "/favicon.ico"].includes(url.pathname)
  ) {
    return NextResponse.next();
  }

  // Bot detection
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  const isKnownBot = searchEngineBots.some((bot) => userAgent.includes(bot));
  const isMaliciousBot = botKeywords.some((bot) => userAgent.includes(bot));

  if (isMaliciousBot && !isKnownBot) {
    return new NextResponse("Bot detected", {
      status: 403,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      },
    });
  }

  // Invalid path or query
  if (
    invalidPattern.test(url.pathname) ||
    [...url.searchParams.values()].some((value) => invalidPattern.test(String(value)))
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:json|csv)$).*)"],
};

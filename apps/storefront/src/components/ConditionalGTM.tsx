"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { GoogleTagManager } from "@next/third-parties/google";

export default function ConditionalGTM({ gtmId }: { gtmId: string }) {
  useEffect(() => {
    // Check consent status when component mounts
    const consent = Cookies.get("cookie-consent");
    const analyticsConsent = Cookies.get("analytics-cookies");

    if (consent === "accepted" && analyticsConsent === "accepted") {
      // Initialize dataLayer if it doesn't exist
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      });

      // Update gtag consent if available
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }
    }
  }, []);

  const consent = Cookies.get("cookie-consent");
  const analyticsConsent = Cookies.get("analytics-cookies");

  // Only render GTM if consent is given
  if (consent !== "accepted" || analyticsConsent !== "accepted") {
    return null;
  }

  return <GoogleTagManager gtmId={gtmId} />;
}

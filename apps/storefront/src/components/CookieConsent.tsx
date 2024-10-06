"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Messages } from "@/lib/util";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button/Button";

interface Props {
  messages: Messages;
}

const CookieConsent: React.FC<Props> = ({ messages }) => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const consent = Cookies.get("cookie-consent");
    if (pathname === "/cookie-settings" || consent) {
      setShowBanner(false);
    } else if (!consent) {
      setShowBanner(true);
    }
  }, [pathname]);

  const handleAccept = () => {
    Cookies.set("cookie-consent", "accepted", { expires: 365 });
    Cookies.set("essential-cookies", "accepted", { expires: 365 });
    Cookies.set("analytics-cookies", "accepted", { expires: 365 });
    Cookies.set("marketing-cookies", "accepted", { expires: 365 });
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
      });
    }
    setShowBanner(false);
  };

  const handleDecline = () => {
    Cookies.set("cookie-consent", "declined", { expires: 365 });
    Cookies.set("essential-cookies", "accepted", { expires: 365 });
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "denied",
      });
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 mb-4 ml-4 w-auto bg-white text-gray-900 border border-gray-200 rounded-lg shadow-2xl z-50 max-w-[512px]">
      <div className="p-4 flex flex-col">
        <div className="text-left mb-4">
          <p className="text-sm mb-2">
            {messages["app.consent.text"]}
            <Link
              href="/politica-cookie"
              className="hover:text-action-1 hover:border-action-1 border-b border-b-black pb-1 ml-1"
            >
              {messages["app.consent.text2"]}
            </Link>
            &nbsp;{messages["app.consent.text3"]}
            <Link
              href="/cookie-settings"
              className="hover:text-action-1 hover:border-action-1 border-b border-b-black pb-1 ml-1"
            >
              {messages["app.consent.text4"]}
            </Link>
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center">
          <Button
            onClick={handleAccept}
            variant="tertiary"
            label={messages["app.consent.acceptAll"]}
            className="!text-sm !normal-case"
          />
          <Button
            onClick={handleDecline}
            variant="secondary"
            label={messages["app.consent.declineAll"]}
            className="md:ml-4 !text-sm !normal-case"
          />
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

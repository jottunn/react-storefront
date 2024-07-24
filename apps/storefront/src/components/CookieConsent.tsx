"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Messages } from "@/lib/util";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    setShowBanner(false);
  };

  const handleDecline = () => {
    Cookies.set("cookie-consent", "declined", { expires: 365 });
    Cookies.set("essential-cookies", "accepted", { expires: 365 });
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
          <button
            onClick={handleAccept}
            className="bg-black text-white text-sm px-4 py-2 hover:bg-gray-700"
          >
            {messages["app.consent.acceptAll"]}
          </button>
          <button
            onClick={handleDecline}
            className="text-main-1 text-sm px-4 py-2 mt-4 md:mt-0 md:ml-4 border border-gray-700 hover:bg-main-1 hover:text-white"
          >
            {messages["app.consent.declineAll"]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

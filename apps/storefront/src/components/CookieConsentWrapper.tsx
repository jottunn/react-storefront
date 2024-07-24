import React from "react";
import CookieConsent from "./CookieConsent";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";

const CookieConsentWrapper: React.FC = () => {
  const messages = getMessages(DEFAULT_LOCALE, "app.consent");
  return <CookieConsent messages={messages} />;
};

export default CookieConsentWrapper;

import { getMessages } from "@/lib/util";
import Link from "next/link";
import ManageCookies from "./ManageCookies";
import { STOREFRONT_NAME } from "@/lib/const";
import { DEFAULT_LOCALE } from "@/lib/regions";

export const metadata = {
  title: `Setări Cookie-uri | ${STOREFRONT_NAME}`,
  description: "Revizuiește și gestionează setările cookie-urilor pe Surmont.ro",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
      ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/cookie-settings`
      : undefined,
  },
};

export default function Page() {
  const messages = getMessages(DEFAULT_LOCALE, "app.consent");
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold mb-6">{messages["app.consent.cookiesSettingsTitle"]}</h1>
      <p className="mb-6 text-md">
        {messages["app.consent.cookiesSettingsText"]}&nbsp;
        <Link
          href="/politica-cookie"
          className="hover:text-action-1 hover:border-action-1 border-b border-b-black pb-1 ml-1"
        >
          {messages["app.consent.policy"]}
        </Link>
        .
      </p>
      <ManageCookies messages={messages} />
    </div>
  );
}

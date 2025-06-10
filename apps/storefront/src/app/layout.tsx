import "./globals.css";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Navbar } from "@/components/nav/Navbar";
import Providers from "@/components/Providers";
import { CheckoutProvider } from "@/lib/hooks/CheckoutContext";
import Footer from "@/components/footer/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import CookieConsentWrapper from "@/components/CookieConsentWrapper";
import { STOREFRONT_URL } from "@/lib/const";
import ConditionalGTM from "@/components/ConditionalGTM";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STOREFRONT_NAME,
  description: process.env.NEXT_PUBLIC_STOREFRONT_NAME,
  metadataBase: STOREFRONT_URL ? new URL(STOREFRONT_URL) : undefined,
};

export default function RootLayout(props: { children: ReactNode; params: { locale?: string } }) {
  const { children, params } = props;
  const locale = params.locale || "ro";

  return (
    <html lang={locale} className={`${fontVariables.openSans} ${fontVariables.raleway} min-h-dvh`}>
      {process.env.NEXT_PUBLIC_GTM && <ConditionalGTM gtmId={process.env.NEXT_PUBLIC_GTM} />}
      <body className="font-sans antialiased min-h-dvh prose-h1:font-dark prose-h2:font-black">
        <NuqsAdapter>
          <CheckoutProvider>
            {/* @ts-expect-error Async Server Component */}
            <Navbar />
            <Providers>{children}</Providers>
            {/* @ts-expect-error Async Server Component */}
            <Footer />
            <CookieConsentWrapper />
            <BackToTopButton />
          </CheckoutProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}

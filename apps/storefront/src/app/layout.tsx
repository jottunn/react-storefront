import localFont from "next/font/local";
import "./globals.css";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Navbar } from "@/components/nav/Navbar";
import Providers from "@/components/ProgressBarProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { CheckoutProvider } from "@/lib/hooks/CheckoutContext";
import Footer from "@/components/footer/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import CookieConsentWrapper from "@/components/CookieConsentWrapper";
import { STOREFRONT_URL } from "@/lib/const";

const openSans = localFont({
  src: "../../public/fonts/OpenSans-VariableFont_wdth,wght.ttf",
  preload: true,
  display: "swap",
});

const raleway = localFont({
  src: "../../public/fonts/Raleway-VariableFont_wght.ttf",
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STOREFRONT_NAME,
  description: process.env.NEXT_PUBLIC_STOREFRONT_NAME,
  metadataBase: STOREFRONT_URL ? new URL(STOREFRONT_URL) : undefined,
};

export default function RootLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <html lang="ro" className={`${openSans.className} min-h-dvh`}>
      <body className="min-h-dvh prose-h1:font-dark prose-h2:font-black">
        <AuthProvider>
          <CheckoutProvider>
            {/* @ts-expect-error Async Server Component */}
            <Navbar />
            <Providers>{children}</Providers>
            {/* @ts-expect-error Async Server Component */}
            <Footer />
            <CookieConsentWrapper />
            <BackToTopButton />
          </CheckoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

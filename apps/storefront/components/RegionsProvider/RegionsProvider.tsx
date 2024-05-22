import { useRouter } from "next/router";
import React, { ReactNode, useState } from "react";
import { IntlProvider } from "react-intl";
import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { Channel, CHANNELS, DEFAULT_CHANNEL, DEFAULT_LOCALE, localeToEnum } from "@/lib/regions";
import createSafeContext from "@/lib/useSafeContext";
import { formatAsMoney } from "@/lib/util";
import { LanguageCodeEnum, PriceFragment } from "@/saleor/api";
import * as sourceOfTruth from "../../locale/en.json";
import * as ro from "../../locale/ro.json";
import { setCookie } from "nookies";

export interface RegionsConsumerProps {
  channels: Channel[];
  defaultChannel: Channel;
  currentChannel: Channel;
  currentLocale: string;
  query: {
    channel: string;
    locale: LanguageCodeEnum;
  };
  setCurrentChannel: (slug: string) => Promise<void>;
  formatPrice: (price?: PriceFragment) => string;
}

export const [useContext, Provider] = createSafeContext<RegionsConsumerProps>();

export type LocaleMessages = typeof sourceOfTruth;
export type LocaleKey = keyof LocaleMessages;
export function importMessages(locale: string): LocaleMessages {
  switch (locale) {
    case "en":
      return sourceOfTruth;
    case "ro":
      return ro;
    default:
      return sourceOfTruth;
  }
}

export interface RegionsProviderProps {
  children: React.ReactNode;
}

export function RegionsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { resetCheckoutToken } = useCheckout();
  const [currentChannelSlug, setCurrentChannelSlug] = useState(router.query.channel);

  const setCurrentChannel = async (channel: string) => {
    resetCheckoutToken();
    setCurrentChannelSlug(channel);

    // Set a cookie for the current channel
    setCookie(null, "currentChannel", channel, {
      maxAge: 1 * 24 * 60 * 60, // 1 days
      path: "/",
    });
  };

  const locale = router.locale || DEFAULT_LOCALE;

  const currentChannel =
    CHANNELS.find(({ slug }) => slug === currentChannelSlug) || DEFAULT_CHANNEL;

  const formatPrice = (price?: PriceFragment) => {
    // console.log(formatPrice);
    // console.log(price);
    return formatAsMoney(
      price?.amount || 0,
      price?.currency || currentChannel.currencyCode,
      locale,
    );
  };

  const providerValues: RegionsConsumerProps = {
    channels: CHANNELS,
    defaultChannel: DEFAULT_CHANNEL,
    currentChannel,
    setCurrentChannel,
    currentLocale: locale,
    query: {
      channel: currentChannel.slug,
      locale: localeToEnum(locale),
    },
    formatPrice,
  };

  const msgs = importMessages(locale);
  //console.log(providerValues);
  return (
    <Provider value={providerValues}>
      <IntlProvider messages={msgs} locale={locale} defaultLocale={DEFAULT_LOCALE}>
        {children}
      </IntlProvider>
    </Provider>
  );
}

export const useRegions = useContext;

export default RegionsProvider;

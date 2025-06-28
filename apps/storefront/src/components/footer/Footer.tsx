import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes } from "react";
import {
  LanguageCodeEnum,
  MenuGetBySlugDocument,
  MenuGetBySlugQuery,
  PageTypesDocument,
  PageTypesQuery,
} from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import getLinkPath from "@/lib/menus";
import edjsHTML from "editorjs-html";
import NewsletterSubscribe from "../Newsletter/NewsletterSubscribe";
export type FooterProps = HTMLAttributes<HTMLElement>;
import { getMessages } from "src/lib/util";
import SvgSprite from "../SvgSprite";
import UserMenu from "../nav/components/UserMenu/UserMenu";
import FooterCartButton from "./FooterCartButton";
import React from "react";

export default async function Footer({ className, ...rest }: FooterProps) {
  "use server";
  const messages = getMessages(DEFAULT_LOCALE, "app.nwl");
  let footerNavLinks, contactContentResponse, legalNavLinks;

  try {
    [footerNavLinks, legalNavLinks, contactContentResponse] = await Promise.all([
      executeGraphQL<MenuGetBySlugQuery, { slug: string; channel: string; locale: string }>(
        MenuGetBySlugDocument,
        {
          variables: { slug: "footer", ...defaultRegionQuery() },
          revalidate: 60 * 60,
        },
      ),
      executeGraphQL<MenuGetBySlugQuery, { slug: string; channel: string; locale: string }>(
        MenuGetBySlugDocument,
        {
          variables: { slug: "legal", ...defaultRegionQuery() },
          revalidate: 60 * 60,
        },
      ),
      executeGraphQL<PageTypesQuery, { filter: any; locale: LanguageCodeEnum }>(PageTypesDocument, {
        variables: { filter: { slugs: ["get-in-touch"] }, locale: DEFAULT_LOCALE },
        revalidate: 60 * 60,
      }),
    ]);
  } catch (error) {
    // Don't return null, just continue with undefined values
    console.error("Error fetching footer data:", error);
  }

  const parser = edjsHTML();
  const contactContent = contactContentResponse?.pages?.edges[0];
  const contactParsedContent =
    contactContent?.node.content && parser.parse(JSON.parse(contactContent.node.content)).join("");
  const contactFb = contactContent?.node?.metadata.find((m) => m.key === "facebook");
  const contactInsta = contactContent?.node?.metadata.find((m) => m.key === "instagram");

  return (
    <footer className={clsx("pt-10 border-t-2", className)} {...rest}>
      <SvgSprite />
      <div className="sm:container px-6 text-left md:grid md:gap-4 md:grid-cols-[3fr_1fr]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full mb-4">
          {footerNavLinks?.menu?.items?.map((item, i) => (
            <div key={item?.id}>
              <span className="block text-[1.3rem] md:text-md font-bold mb-4 uppercase">
                {item?.name}
              </span>
              <ul className="list-none mb-8">
                {i === 0 && (
                  <li className="mb-2">
                    <UserMenu display="footer" messages={messages} />
                  </li>
                )}
                {item?.children?.map((sub) => (
                  <li key={sub?.id} className="mb-2">
                    {sub?.url ? (
                      <Link
                        href={sub.url}
                        rel="noreferrer"
                        className="text-base cursor-pointer hover:underline"
                        data-testid={`footerExternalLinks${sub?.name}`}
                      >
                        {sub?.name}
                      </Link>
                    ) : (
                      <Link
                        key={sub?.id}
                        href={getLinkPath(sub)}
                        className="text-base cursor-pointer hover:underline"
                        data-testid={`footerInternalLinks${sub?.name}`}
                      >
                        {sub?.name}
                      </Link>
                    )}
                  </li>
                ))}
                {i === 0 && (
                  <li className="mb-2">
                    <FooterCartButton messages={messages} />
                  </li>
                )}
              </ul>
            </div>
          ))}

          <div className="mb-6">
            {contactContent && (
              <>
                <p className="block text-[1.3rem] md:text-md font-bold mb-4 uppercase">
                  {contactContent.node.title}
                </p>
                {contactParsedContent && (
                  <div
                    className="text-base mt-3 nowrap [&_p]:leading-[1.6] leading-[1.6]"
                    dangerouslySetInnerHTML={{ __html: contactParsedContent }}
                  />
                )}
              </>
            )}
            <div className="flex space-x-4 mt-4">
              {contactFb && (
                <a
                  href={contactFb?.value || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-85"
                  title="facebook"
                >
                  <svg width="25" height="25">
                    <use xlinkHref="#facebook-icon" />
                  </svg>
                </a>
              )}
              {contactInsta && (
                <a
                  href={contactInsta?.value || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:opacity-85"
                  title="instagram"
                >
                  <svg width="25" height="25">
                    <use xlinkHref="#instagram-icon" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
        <div key="nwl" className="pb-10 md:pb-0">
          <NewsletterSubscribe messages={messages} />
        </div>
      </div>
      <div className="sm:container px-6 md:flex justify-center pt-8 pb-2 border-t border-main-6 space-x-4">
        <a href="#" className="mb-2 inline-block">
          <Image
            src="/visa-master-card-logos.jpg"
            alt="visa mastercard"
            width="232"
            height="54"
            priority={false}
          />
        </a>
        <a
          href="https://anpc.ro/ce-este-sal"
          target="_blank"
          rel="noreferrer"
          className="mb-2 inline-block"
        >
          <Image src={"/sal.svg"} alt="sal" width="180" height="45" priority={false} />
        </a>
        <a
          href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO"
          target="_blank"
          rel="noreferrer"
          className="mb-2 inline-block"
        >
          <Image src={"/sol.svg"} alt="sol" width="180" height="45" priority={false} />
        </a>
      </div>
      <div className="bg-gray-100 pt-8 pb-10">
        <div className="container text-center">
          <p className="text-sm md:text-base text-main-1 flex-grow text-left mb-4 block md:inline">
            © Copyright {new Date().getFullYear()} Surmont Shop. Toate drepturile rezervate.
            <span className="pl-6 hidden md:inline">|</span>
          </p>
          {legalNavLinks?.menu?.items?.map((item, i) =>
            item?.url ? (
              <Link
                key={`legal${i}`}
                href={item.url}
                rel="noreferrer"
                className="text-sm md:text-base px-4 hover:text-action-1 hover:underline inline-block pb-2"
                data-testid={`footerExternalLinks${item?.name}`}
              >
                {item?.name}
              </Link>
            ) : (
              <Link
                key={`legal${i}`}
                href={getLinkPath(item)}
                className="text-sm md:text-base px-4 hover:text-action-1 hover:underline inline-block pb-2"
                data-testid={`footerInternalLinks${item?.name}`}
              >
                {item?.name}
              </Link>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}

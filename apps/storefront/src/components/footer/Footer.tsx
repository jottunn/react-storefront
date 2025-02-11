import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes } from "react";
import styles from "./Footer.module.css";
import Box from "../Box";
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
import xss from "xss";
import NewsletterSubscribe from "../Newsletter/NewsletterSubscribe";
export type FooterProps = HTMLAttributes<HTMLElement>;
import { getMessages } from "src/lib/util";
import SvgSprite from "../SvgSprite";
import CartNavItem from "../cart/CartNavItem";

export default async function Footer({ className, ...rest }: FooterProps) {
  "use server";
  const messages = getMessages(DEFAULT_LOCALE, "app.nwl");
  let footerNavLinks, contactContentResponse, legalNavLinks;
  try {
    footerNavLinks = await executeGraphQL<
      MenuGetBySlugQuery,
      { slug: string; channel: string; locale: string }
    >(MenuGetBySlugDocument, {
      variables: { slug: "footer", ...defaultRegionQuery() },
      revalidate: 60 * 60,
    });
  } catch {
    return null;
  }

  try {
    legalNavLinks = await executeGraphQL<
      MenuGetBySlugQuery,
      { slug: string; channel: string; locale: string }
    >(MenuGetBySlugDocument, {
      variables: { slug: "legal", ...defaultRegionQuery() },
      revalidate: 60 * 60,
    });
  } catch {
    return null;
  }

  try {
    contactContentResponse = await executeGraphQL<
      PageTypesQuery,
      { filter: any; locale: LanguageCodeEnum }
    >(PageTypesDocument, {
      variables: { filter: { slugs: ["get-in-touch"] }, locale: DEFAULT_LOCALE },
      revalidate: 60,
    });
  } catch {
    return null;
  }

  const parser = edjsHTML();
  const contactContent = contactContentResponse.pages?.edges[0];
  const contactParsedContent =
    contactContent?.node.content && parser.parse(JSON.parse(contactContent.node.content));
  const contactFb = contactContent?.node?.metadata.find((m) => m.key === "facebook");
  const contactInsta = contactContent?.node?.metadata.find((m) => m.key === "instagram");

  return (
    <footer className={clsx(styles.footer, className)} {...rest}>
      <SvgSprite />
      <Box className={styles["footer-inner"]}>
        <div className={styles["footer-grid"]}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full mb-4">
            {footerNavLinks &&
              footerNavLinks.menu &&
              footerNavLinks.menu.items &&
              footerNavLinks.menu?.items.length > 0 &&
              footerNavLinks.menu?.items?.map((item, i) => (
                <div className="" key={item?.id}>
                  <span className={styles["menu-heading"]}>{item?.name}</span>
                  <ul className={styles.menu}>
                    {item?.children?.map((sub) => (
                      <li key={sub?.id}>
                        {sub?.url ? (
                          <Link
                            href={sub.url}
                            rel="noreferrer"
                            className={styles["menu-link"]}
                            data-testid={`footerExternalLinks${sub?.name}`}
                          >
                            {sub?.name}
                          </Link>
                        ) : (
                          <Link
                            href={getLinkPath(sub)}
                            className={styles["menu-link"]}
                            data-testid={`footerInternalLinks${sub?.name}`}
                          >
                            {sub?.name}
                          </Link>
                        )}
                      </li>
                    ))}
                    {i === 0 && <CartNavItem display="footer" />}
                  </ul>
                </div>
              ))}

            <div className={clsx("no-margin-p mb-6 prose-2xl", styles["contact-footer"])}>
              {contactContent && (
                <>
                  <p className={styles["menu-heading"]}>{contactContent.node.title}</p>
                  {contactParsedContent &&
                    contactParsedContent.map((content: any) => (
                      <div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
                    ))}
                </>
              )}
              <div className="flex space-x-4 mt-4">
                {contactFb && (
                  <a
                    href={contactFb?.value || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:opacity-85"
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

        <div className="md:flex justify-center pt-8 pb-2 border-t border-main-6">
          <div className="flex space-x-4">
            <a href="#" className="mb-2 inline-block">
              <Image
                src={"/visa-master-card-logos.jpg"}
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
        </div>
      </Box>
      <div className="bg-gray-100 pt-8 pb-10">
        <div className="container text-center">
          <p className="text-sm md:text-base text-main-1 flex-grow text-left mb-4 block md:inline">
            © Copyright {new Date().getFullYear()} Surmont Shop. Toate drepturile rezervate.
            <span className="pl-6 hidden md:inline">|</span>
          </p>
          {legalNavLinks &&
            legalNavLinks.menu &&
            legalNavLinks.menu.items &&
            legalNavLinks.menu?.items.length > 0 &&
            legalNavLinks.menu?.items?.map((item, i) => (
              <Link
                key={item.id}
                href={item.url ? item.url : "#"}
                rel="noreferrer"
                className="text-sm md:text-base px-4 hover:text-action-1 hover:underline inline-block pb-2"
              >
                {item?.name}
              </Link>
            ))}
        </div>
      </div>
    </footer>
  );
}

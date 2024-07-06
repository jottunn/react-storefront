import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes } from "react";
import styles from "./Footer.module.css";
import Box from "../Box";
import {
  CollectionsByMetaKeyDocument,
  CollectionsByMetaKeyQuery,
  FooterMenuDocument,
  FooterMenuQuery,
  LanguageCodeEnum,
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

export default async function Footer({ className, ...rest }: FooterProps) {
  const messages = getMessages(DEFAULT_LOCALE, "app.nwl");
  const footerNavLinks = await executeGraphQL<
    FooterMenuQuery,
    { slug: string; channel: string; locale: string }
  >(FooterMenuDocument, {
    variables: { slug: "navbar", ...defaultRegionQuery() },
    revalidate: 60 * 60,
  });

  const brandCollections = await executeGraphQL<
    CollectionsByMetaKeyQuery,
    { filter: any; channel: string; locale: string }
  >(CollectionsByMetaKeyDocument, {
    variables: {
      filter: {
        metadata: [{ key: "isBrand", value: "YES" }],
        published: "PUBLISHED",
      },
      ...defaultRegionQuery(),
    },
    revalidate: 60 * 60 * 24,
  });

  const contactContentResponse = await executeGraphQL<
    PageTypesQuery,
    { filter: any; locale: LanguageCodeEnum }
  >(PageTypesDocument, {
    variables: { filter: { slugs: ["get-in-touch"] }, locale: DEFAULT_LOCALE },
    revalidate: 60,
  });

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
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 md:gap-12 lg:gap-20 py-12 md:py-32 mb-20 items-center justify-items-center w-full border-b border-dark=300 md:min-h-[90px]">
          {brandCollections &&
            brandCollections.collections?.edges.map((brand) => {
              return (
                <Link
                  key={brand.node.slug}
                  href={`/collections/${brand.node.slug}`}
                  className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block"
                >
                  {brand.node.backgroundImage ? (
                    <Image
                      src={brand.node.backgroundImage.url}
                      alt={brand.node.name}
                      width={200}
                      height={200}
                      className="hover:brightness-125 hover:contrast-115 transition-all duration-30"
                    />
                  ) : (
                    brand.node.name
                  )}
                </Link>
              );
            })}
        </div>
        <div className={styles["footer-grid"]}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-4">
            {footerNavLinks &&
              footerNavLinks.menu &&
              footerNavLinks.menu.items &&
              footerNavLinks.menu?.items.length > 0 &&
              footerNavLinks.menu?.items?.map((item) => (
                <div className="" key={item?.id}>
                  {item?.url ? (
                    <Link href={item.url} rel="noreferrer" className={styles["menu-heading"]}>
                      {item?.name}
                    </Link>
                  ) : (
                    <Link href={getLinkPath(item)} passHref legacyBehavior>
                      <a href="pass" className={styles["menu-heading"]}>
                        {item?.name}
                      </a>
                    </Link>
                  )}
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
                  </ul>
                </div>
              ))}

            <div className="no-margin-p mb-6 prose-2xl">
              {contactContent && (
                <>
                  <p className="title-font font-bold text-[1.3rem] md:text-md uppercase mb-5">
                    {contactContent.node.title}
                  </p>
                  {contactParsedContent &&
                    contactParsedContent.map((content: any) => (
                      <div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
                    ))}
                </>
              )}
              <div className="flex space-x-4">
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

        <div className="md:flex items-start items-center pt-8 border-t border-main-6">
          <p className="text-sm text-main-2 flex-grow text-left mb-4">
            © Copyright {new Date().getFullYear()} Surmont Shop. Toate drepturile rezervate.
          </p>
          <div className="flex justify-center space-x-4">
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
    </footer>
  );
}

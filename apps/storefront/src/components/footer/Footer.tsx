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
  PageFragment,
  PageTypesDocument,
  PageTypesQuery,
} from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import getLinkPath from "@/lib/menus";
import edjsHTML from "editorjs-html";
import xss from "xss";
export type FooterProps = HTMLAttributes<HTMLElement>;

export default async function Footer({ className, ...rest }: FooterProps) {
  const footerNavLinks = await executeGraphQL<
    FooterMenuQuery,
    { slug: string; channel: string; locale: string }
  >(FooterMenuDocument, {
    variables: { slug: "navbar", ...defaultRegionQuery() },
    revalidate: 60 * 60 * 24,
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
    variables: { filter: { slugs: ["contact"] }, locale: DEFAULT_LOCALE },
    revalidate: 60,
  });

  const parser = edjsHTML();
  const contactContent = contactContentResponse.pages?.edges[0];
  const contactParsedContent =
    contactContent?.node.content && parser.parse(JSON.parse(contactContent.node.content));
  const contactFb = contactContent?.node?.metadata.find((m) => m.key === "facebook");

  return (
    <footer className={clsx(styles.footer, className)} {...rest}>
      <Box className={styles["footer-inner"]}>
        <div className="grid grid-cols-4 md:grid-cols-10 gap-6 pb-8 mb-12 items-center justify-items-center w-full border-b border-dark=300 md:min-h-[90px]">
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
                    />
                  ) : (
                    brand.node.name
                  )}
                </Link>
              );
            })}
        </div>
        <div className={styles["footer-grid"]}>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            {footerNavLinks &&
              footerNavLinks.menu?.items?.map((item) => (
                <div className="" key={item?.id}>
                  {item?.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles["menu-heading"]}
                    >
                      {item?.name}
                    </a>
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
                          <a
                            href={sub.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles["menu-link"]}
                            data-testid={`footerExternalLinks${sub?.name}`}
                          >
                            {sub?.name}
                          </a>
                        ) : (
                          <Link href={getLinkPath(sub)} passHref legacyBehavior>
                            <a
                              href="pass"
                              className={styles["menu-link"]}
                              data-testid={`footerInternalLinks${sub?.name}`}
                            >
                              {sub?.name}
                            </a>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
          <div className="no-margin-p mb-6 prose-2xl">
            {contactContent && (
              <>
                <p className="font-bold text-md uppercase mb-5">{contactContent.node.title}</p>
                {contactParsedContent &&
                  contactParsedContent.map((content: any) => (
                    <div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
                  ))}
              </>
            )}
          </div>
          <div>&nbsp;</div>
          <div key="social-footer" className="md:text-right">
            <a className="mb-2 inline-block">
              <img
                src={"/visa-master-card-logos.jpg"}
                alt="visa mastercard"
                width="232"
                height="54"
              />
            </a>
            <a
              href="https://anpc.ro/ce-este-sal"
              target="_blank"
              rel="noreferrer"
              className="mb-2 inline-block"
            >
              <img src={"/sal.svg"} alt="sal" width="180" height="45" />
            </a>
            <br />
            <a
              href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO"
              target="_blank"
              rel="noreferrer"
              className="mb-2 inline-block"
            >
              <img src={"/sol.svg"} alt="sol" width="180" height="45" />
            </a>
            <br />
            <div className="mt-8 inline-block">
              {contactFb && (
                <a href={contactFb?.value || "#"} target="_blank" rel="noreferrer">
                  <img src="/facebook.svg" alt="facebook" width="20" height="20" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start items-center mt-24 border-t border-main-6">
          <p className="text-sm text-main-3 flex-grow text-left">
            © Copyright {new Date().getFullYear()} Surmont Shop. Toate drepturile rezervate.
          </p>
        </div>
      </Box>
    </footer>
  );
}

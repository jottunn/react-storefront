import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes, useEffect, useState } from "react";

import { getLinkPath } from "@/lib/menus";
import { usePaths } from "@/lib/paths";
import { useFooterMenuQuery, usePageTypesBySlugQuery, usePageTypesQuery } from "@/saleor/api";

import { Box } from "../Box";
import { ChannelDropdown } from "../regionDropdowns/ChannelDropdown";
import { LocaleDropdown } from "../regionDropdowns/LocaleDropdown";
import { useRegions } from "../RegionsProvider";
import styles from "./Footer.module.css";
import { mapEdgesToItems } from "@/lib/maps";
import RichText from "../RichText";
import { translate } from "@/lib/translations";
import { UPLOAD_FOLDER } from "@/lib/const";

export type FooterProps = HTMLAttributes<HTMLElement>;

export function Footer({ className, ...rest }: FooterProps) {
  const paths = usePaths();
  const { query } = useRegions();
  const { data, error } = useFooterMenuQuery({ variables: { ...query } });
  const [pageTypeIds, setPageTypeIds] = useState({ brand: "", contact: "" });

  const { data: pageTypeData, loading: pageTypeLoading } = usePageTypesBySlugQuery({
    variables: {
      filter: {
        slugs: ["brand", "contact"],
      },
    },
  });

  useEffect(() => {
    if (!pageTypeLoading) {
      const brandPageType =
        pageTypeData?.pageTypes?.edges.find((edge) => edge.node.slug === "brand")?.node.id || "";
      const contactPageType =
        pageTypeData?.pageTypes?.edges.find((edge) => edge.node.slug === "contact")?.node.id || "";
      setPageTypeIds({ brand: brandPageType, contact: contactPageType });
    }
  }, [pageTypeData, pageTypeLoading]);

  const { data: pageData, error: pageError } = usePageTypesQuery({
    skip: !pageTypeIds.brand || !pageTypeIds.contact, // Only execute the query if the IDs are available
    variables: {
      filter: {
        pageTypes: [pageTypeIds.brand, pageTypeIds.contact],
      },
      locale: query.locale,
    },
  });

  const pagesDataArr = mapEdgesToItems(pageData?.pages);
  const brandsDataArr = pagesDataArr.filter((page) => page.pageType.name === "Brand");
  const contactDataArr = pagesDataArr.filter((page) => page.pageType.name === "Contact");
  const contactFb = contactDataArr[0]?.metadata.find((m) => m.key === "facebook");

  if (error) {
    console.error("Footer component error", error.message);
  }
  if (pageError) return <div>Error loading brands: {pageError.message}</div>;

  const menu = data?.menu?.items || [];
  return (
    <footer className={clsx(styles.footer, className)} {...rest}>
      <Box className={styles["footer-inner"]}>
        <div className="grid grid-cols-4 md:grid-cols-12 gap-4 pb-8 mb-12 items-center justify-items-center w-full border-b border-dark=300 md:min-h-[90px]">
          {brandsDataArr &&
            brandsDataArr.map((brand) => {
              const targetAttribute = brand.attributes.find(
                (attribute) => attribute.attribute.inputType === "FILE",
              );
              if (targetAttribute && targetAttribute.values.length > 0) {
                return (
                  <Link
                    key={brand.slug}
                    href={paths.brands._slug(brand.slug || "").$url()}
                    passHref
                    legacyBehavior
                  >
                    <a className="text-md mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600 block">
                      <Image
                        src={`${UPLOAD_FOLDER ?? ""}/${targetAttribute?.values[0].name ?? ""}`}
                        alt={brand.title}
                        width={200}
                        height={200}
                      />
                    </a>
                  </Link>
                );
              }
              return null;
            })}
        </div>
        <div className={styles["footer-grid"]}>
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            {menu.map((item) => (
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
          <div className="no-margin-p mb-6">
            {contactDataArr[0] && (
              <>
                <p className="font-bold text-md uppercase mb-5">
                  {translate(contactDataArr[0], "title") || ""}
                </p>
                <RichText jsonStringData={translate(contactDataArr[0], "content") || ""} />
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
              <a href={contactFb?.value || "#"} target="_blank" rel="noreferrer">
                <img src="/facebook.svg" alt="facebook" width="20" height="20" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-start items-center mt-24 border-t border-main-6">
          <p className="text-sm text-main-3 flex-grow text-left">
            © Copyright {new Date().getFullYear()} Surmont Shop. Toate drepturile rezervate.
          </p>
          <div className="invisible md:visible flex gap-4">
            <ChannelDropdown horizontalAlignment="right" />
            <LocaleDropdown horizontalAlignment="right" />
          </div>
        </div>
      </Box>
    </footer>
  );
}

export default Footer;

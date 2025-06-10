import { STOREFRONT_URL } from "@/lib/const";
import Link from "next/link";

const ButtonLink = ({ data }: any) => {
  const url = data.buttonURL || `${STOREFRONT_URL}/${data?.page?.data?.attributes?.slug}`;
  return (
    <Link
      href={url}
      className={`button button-${data.type || "tertiary"} my-4`}
      target={data.newTab ? "_blank" : "_self"}
    >
      {data.buttonText}
    </Link>
  );
};

export default ButtonLink;

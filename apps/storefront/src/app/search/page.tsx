import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { STOREFRONT_NAME } from "@/lib/const";
import SearchClient from "./SearchClient";

const messages = getMessages(DEFAULT_LOCALE);
export const metadata = {
  title: `${messages["app.search.searchTitle"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.search.searchTitle"]} - Surmont.ro`,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
      ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/search`
      : undefined,
  },
};


export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Record<"query" | "cursor", string | string[] | undefined>;
  params: { channel: string };
}) {
  const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;
  const searchValue = searchParams.query;
  if (!searchValue) {
    redirect("/");
  }

  if (Array.isArray(searchValue)) {
    const firstValidSearchValue = searchValue.find((v) => v.length > 0);
    if (!firstValidSearchValue) {
      redirect("/");
    }
    redirect(`/search?${new URLSearchParams({ query: firstValidSearchValue }).toString()}`);
  }


  return (
    <main>
      <div className="container px-8 mt-4 mb-40">
        <SearchClient messages={messages} />
      </div>
    </main>
  );
}

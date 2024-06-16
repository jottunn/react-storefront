import CheckoutForm from "@/components/checkout/CheckoutForm";
import CheckoutSidebar from "@/components/checkout/sidebar/CheckoutSidebar";
import { invariant } from "ts-invariant";
import * as Checkout from "@/lib/checkout";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { executeGraphQL } from "@/lib/graphql";
import { UserDocument, UserQuery } from "@/saleor/api";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { checkout?: string; order?: string };
}) {
  invariant(
    process.env.NEXT_PUBLIC_SALEOR_API_URL,
    "Missing NEXT_PUBLIC_SALEOR_API_URL env variable",
  );

  if (!searchParams.checkout && !searchParams.order) {
    return null;
  }
  const checkout = searchParams.checkout ? await Checkout.find(searchParams.checkout) : null;
  const messages = getMessages(DEFAULT_LOCALE);
  const { user } = await executeGraphQL<UserQuery, {}>(UserDocument, {
    cache: "no-cache",
  });
  return (
    <main className="mt-6 flex-1 container pt-8 px-8">
      <div className="grid min-h-screen grid-cols-1 gap-x-16 lg:grid-cols-2">
        <div className="items-end order-1 md:order-0">
          {checkout && checkout.lines.length > 0 && (
            <CheckoutForm messages={messages} user={user} />
          )}
        </div>
        <div className="z-0 flex h-fit w-full flex-col before:absolute before:bottom-0 before:left-1/2 before:top-0 before:-z-10 before:w-1/2 before:border-l before:border-main-5 before:bg-main-7 before:content-none before:lg:content-[''] order-0 md:order-1">
          <CheckoutSidebar messages={messages} />
        </div>
      </div>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components"; // Adjust path as necessary
import { useConfirmAccountMutation } from "@/saleor/api";
import { useIntl } from "react-intl";
import { pagesPath } from "@/lib/$path";
import messages from "@/components/translations";

const ConfirmPage = () => {
  const router = useRouter();
  const { email, token } = router.query;
  const [confirmAccountMutation] = useConfirmAccountMutation();
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const t = useIntl();

  useEffect(() => {
    if (typeof email === "string" && typeof token === "string") {
      confirmAccountMutation({
        variables: {
          email: email as string,
          token: token as string,
        },
      }).then((response) => {
        console.log(response);
        if (response.data?.confirmAccount?.errors.length === 0) {
          router.push(
            pagesPath.account.login.$url({
              query: { confirmed: "1" },
            }),
          );
        } else {
          setConfirmationMessage(response.data?.confirmAccount?.errors?.[0].code || "");
        }
      });
    }
  }, [email, token]);

  return (
    <Layout>
      <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
        <div className="w-[85%] md:w-[45%]">
          <h1 className="text-2xl font-bold mt-2">
            {t.formatMessage(messages.accountConfirmTitle)}
          </h1>
          {confirmationMessage && (
            <p className="text-md  mt-2">{t.formatMessage({ id: confirmationMessage })}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmPage;

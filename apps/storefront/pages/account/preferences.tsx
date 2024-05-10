import React, { ReactElement } from "react";

import { AccountLayout } from "@/components";
import { EmailPreferences } from "@/components/accountPreferences/EmailPreferences";
import { PasswordPreferences } from "@/components/accountPreferences/PasswordPreferences";
import { useUser } from "@/lib/useUser";

function AccountPreferencesPage() {
  const { user } = useUser();
  return (
    <>
      <p className="text-lg mb-4">
        {user?.firstName}&nbsp;{user?.lastName}
      </p>
      <div className="checkout-section-container mb-4">
        <EmailPreferences />
      </div>
      <div className="checkout-section-container">
        <PasswordPreferences />
      </div>
    </>
  );
}

export default AccountPreferencesPage;

AccountPreferencesPage.getLayout = function getLayout(page: ReactElement) {
  return <AccountLayout>{page}</AccountLayout>;
};

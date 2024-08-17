import React from "react";
import EmailPreferences from "./profile/EmailPreferences";
import PasswordPreferences from "./profile/PasswordPreferences";
import { User } from "@/saleor/api";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { getCurrentUser } from "../actions";
import LoginForm from "../login/LoginForm";
export const dynamic = "force-dynamic";
const messages = getMessages(DEFAULT_LOCALE);

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user || user === null) {
    return (
      <div className="w-[85%] md:w-[35%]">
        <LoginForm messages={messages} />
      </div>
    );
  }

  return (
    <div>
      <p className="text-lg mb-4 container">
        {user?.firstName}&nbsp;{user?.lastName}
      </p>
      <div className="checkout-section-container mb-4">
        <EmailPreferences messages={messages} user={user as User} />
      </div>
      <div className="checkout-section-container">
        <PasswordPreferences messages={messages} />
      </div>

      <div className="checkout-section-container mt-6">
        <p className="text-md font-semibold">{messages["app.preferences.deleteAccountTitle"]}</p>
        <p className="text-sm">{messages["app.preferences.deleteAccountText"]}</p>
      </div>
    </div>
  );
}

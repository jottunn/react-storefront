"use client";
import React from "react";
import { useUserContext } from "./UserContext";
import EmailPreferences from "./profile/EmailPreferences";
import { useRouter } from "next-nprogress-bar";
import PasswordPreferences from "./profile/PasswordPreferences";

const AccountPage = () => {
  const { user } = useUserContext();
  const router = useRouter();

  if (!user) {
    router.push("/login");
  }

  return (
    <div>
      <p className="text-lg mb-4">
        {user?.firstName}&nbsp;{user?.lastName}
      </p>
      <div className="checkout-section-container mb-4">
        <EmailPreferences />
      </div>
      <div className="checkout-section-container">
        <PasswordPreferences />
      </div>
    </div>
  );
};

export default AccountPage;

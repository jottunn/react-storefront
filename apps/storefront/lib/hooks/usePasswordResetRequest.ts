import { useState, useEffect } from "react";
import { getCurrentHref } from "@/lib/util";
import { useRequestPasswordResetMutation } from "@/saleor/api";

interface PasswordResetFormData {
  email: string;
  shouldAbort: () => Promise<boolean>;
}

export const usePasswordResetRequest = ({ email, shouldAbort }: PasswordResetFormData) => {
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [error, setError] = useState("");
  const [requestPasswordResetMutation] = useRequestPasswordResetMutation();

  useEffect(() => {
    setPasswordResetSent(false);
    setError("");
  }, [email]);

  const onPasswordResetRequest = async () => {
    if (await shouldAbort()) {
      return;
    }

    const response = await requestPasswordResetMutation({
      variables: {
        email: email,
        channel: "default-channel",
        redirectUrl: getCurrentHref(),
      },
    });

    if (response.data && !response.data.requestPasswordReset?.errors?.length) {
      setPasswordResetSent(true);
      //console.log(`A magic link has been sent to ${email}`);
    }
    if (response.data && response.data?.requestPasswordReset?.errors?.length) {
      // Handle displaying the error message
      setError(response.data.requestPasswordReset.errors[0].code);
    } else {
      setPasswordResetSent(true);
      setError(""); // Clear any existing errors
    }
  };

  return {
    onPasswordResetRequest,
    passwordResetSent,
    error,
  };
};

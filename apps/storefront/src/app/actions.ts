"use server";

import { executeGraphQL } from "@/lib/graphql";
import {
  AddressDeleteDocument,
  AddressDeleteMutation,
  AvailableProductFiltersDocument,
  AvailableProductFiltersQuery,
  ConfirmAccountDocument,
  ConfirmAccountMutationResult,
  ConfirmEmailChangeDocument,
  ConfirmEmailChangeMutation,
  LanguageCodeEnum,
  OrderDetailsByTokenDocument,
  OrderDetailsByTokenQuery,
  PasswordChangeDocument,
  PasswordChangeMutation,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductCountableConnection,
  ProductFilterInput,
  RegisterDocument,
  RegisterMutation,
  RequestEmailChangeDocument,
  RequestEmailChangeMutation,
  RequestPasswordResetDocument,
  RequestPasswordResetMutation,
  SetAddressDefaultDocument,
  SetAddressDefaultMutation,
  User,
  UserDocument,
  UserQuery,
} from "@/saleor/api";
import { saleorAuthClient } from "src/app/config";
import { LoginFormData } from "./login/LoginForm";
import { RegisterFormData } from "./register/RegisterForm";
import { BASE_URL } from "@/lib/const";
import { DEFAULT_CHANNEL, defaultRegionQuery } from "@/lib/regions";
import { ResetFormData } from "./reset/ForgotPassword";
import { ResetPasswordFormData } from "./reset/ResetPasswordForm";
import { ConfirmData } from "./confirm/ConfirmResult";

export async function logout() {
  "use server";
  saleorAuthClient.signOut();
}

export async function login(formData: LoginFormData) {
  const email = formData.email.toString();
  const password = formData.password.toString();

  if (!email || !password) {
    return { success: false, errors: ["Email and password are required"] };
  }

  const { data } = await saleorAuthClient.signIn({ email, password }, { cache: "no-store" });

  if (data.tokenCreate.errors.length > 0) {
    const customError = data?.tokenCreate?.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }

  return { success: true, token: data.tokenCreate.token };
}

export async function register(formData: RegisterFormData | any) {
  interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    redirectUrl: string;
    channel: string;
  }
  const confirmUrl = `${BASE_URL}/confirm`;
  const response = await executeGraphQL<RegisterMutation, { input: RegisterInput }>(
    RegisterDocument,
    {
      variables: {
        input: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          redirectUrl: confirmUrl,
          channel: DEFAULT_CHANNEL.slug,
        },
      },
    },
  );

  if (response?.accountRegister?.errors?.length) {
    const customError = response.accountRegister.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }

  return { success: true };
}

export async function reset(formData: ResetPasswordFormData) {
  const response = await saleorAuthClient.resetPassword({
    email: formData.email,
    password: formData.password,
    token: formData.token,
  });

  if (response.data?.setPassword?.errors?.length) {
    const customError = response.data.setPassword.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }
  return { success: true };
}

export async function requestPasswordReset(formData: ResetFormData) {
  const response = await executeGraphQL<
    RequestPasswordResetMutation,
    { email: string; channel: string; redirectUrl: string }
  >(RequestPasswordResetDocument, {
    variables: {
      email: formData.email,
      channel: DEFAULT_CHANNEL.slug,
      redirectUrl: "/reset",
    },
  });

  if (response?.requestPasswordReset?.errors?.length) {
    const customError = response.requestPasswordReset.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }

  return { success: true };
}

export async function confirmAccount(confirmData: ConfirmData) {
  const response = await executeGraphQL<
    ConfirmAccountMutationResult,
    { email: string; token: string }
  >(ConfirmAccountDocument, {
    variables: {
      email: confirmData.email,
      token: confirmData.token,
    },
  });

  if (response.data?.confirmAccount?.errors.length) {
    const customError = response.data.confirmAccount.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }
  return { success: true };
}

export async function getCurrentUser(): Promise<User | undefined> {
  try {
    const { user } = await executeGraphQL<UserQuery, {}>(UserDocument, {
      cache: "no-cache",
    });

    return user as User;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return;
  }
}

export async function getAvailableFilters(productsFilter: ProductFilterInput) {
  const { products } = await executeGraphQL<
    AvailableProductFiltersQuery,
    { filter: ProductFilterInput; channel: string; locale: LanguageCodeEnum }
  >(AvailableProductFiltersDocument, {
    variables: {
      filter: productsFilter,
      ...defaultRegionQuery(),
    },
  });
  return products;
}

export async function getProductCollection(queryVariables: any) {
  const { products } = await executeGraphQL<ProductCollectionQuery, { variables: any }>(
    ProductCollectionDocument,
    {
      variables: queryVariables,
    },
  );

  return products;
}

export const requestEmailChange = async (args: {
  newEmail: string;
  password: string;
  redirectUrl: String;
}) => {
  const { newEmail, password, redirectUrl } = args;
  try {
    const response = await executeGraphQL<
      RequestEmailChangeMutation,
      {
        newEmail: string;
        password: string;
        redirectUrl: String;
      }
    >(RequestEmailChangeDocument, {
      variables: {
        newEmail: newEmail,
        password: password,
        redirectUrl: redirectUrl,
      },
      cache: "no-cache",
    });

    if (response.requestEmailChange?.errors.length) {
      const customError = response.requestEmailChange.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, user: response?.requestEmailChange?.user };
  } catch (error) {
    console.error("Failed to change email:", error);
    return;
  }
};

export const confirmEmailChange = async (args: { token: String }) => {
  const { token } = args;
  try {
    const response = await executeGraphQL<
      ConfirmEmailChangeMutation,
      {
        token: String;
        channel: String;
      }
    >(ConfirmEmailChangeDocument, {
      variables: {
        token: String(token),
        channel: DEFAULT_CHANNEL.slug,
      },
      cache: "no-cache",
    });

    if (response.confirmEmailChange?.errors.length) {
      const customError = response.confirmEmailChange.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to confirm email change:", error);
    return;
  }
};

export const passwordChange = async (args: { newPassword: string; oldPassword: string }) => {
  const { newPassword, oldPassword } = args;
  try {
    const response = await executeGraphQL<
      PasswordChangeMutation,
      {
        newPassword: string;
        oldPassword: string;
      }
    >(PasswordChangeDocument, {
      variables: {
        newPassword: newPassword,
        oldPassword: oldPassword,
      },
      cache: "no-cache",
    });

    if (response.passwordChange?.errors.length) {
      const customError = response.passwordChange.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, user: response.passwordChange?.user };
  } catch (error) {
    console.error("Failed to change password:", error);
    return;
  }
};

export const deleteAddressMutation = async (args: { id: string }) => {
  const { id } = args;
  try {
    const response = await executeGraphQL<
      AddressDeleteMutation,
      {
        id: string;
      }
    >(AddressDeleteDocument, {
      variables: {
        id: id,
      },
      cache: "no-cache",
    });

    if (response.accountAddressDelete?.errors.length) {
      const customError = response.accountAddressDelete.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, addresses: response.accountAddressDelete?.user?.addresses };
  } catch (error) {
    console.error("Failed to remove address:", error);
    return;
  }
};

export const setAddressDefaultMutation = async (args: { id: string; type: string }) => {
  const { id, type } = args;
  try {
    const response = await executeGraphQL<
      SetAddressDefaultMutation,
      {
        id: string;
        type: string;
      }
    >(SetAddressDefaultDocument, {
      variables: {
        id: id,
        type: type,
      },
      cache: "no-cache",
    });

    if (response.accountSetDefaultAddress?.errors.length) {
      const customError = response.accountSetDefaultAddress.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to set default adresss:", error);
    return;
  }
};

export const orderDetails = async (args: { token: String }) => {
  const { token } = args;
  try {
    const response = await executeGraphQL<
      OrderDetailsByTokenQuery,
      {
        token: String;
      }
    >(OrderDetailsByTokenDocument, {
      variables: {
        token: token,
      },
      cache: "no-cache",
    });

    if (response.orderByToken) {
      return { success: true, order: response.orderByToken };
    }
  } catch (error) {
    console.error("Failed to remove address:", error);
    return;
  }
};

"use server";

import { executeGraphQL } from "@/lib/graphql";
import {
  AccountAddressUpdateDocument,
  AccountAddressUpdateMutation,
  AddressDeleteDocument,
  AddressDeleteMutation,
  AddressInput,
  AvailableProductFiltersDocument,
  AvailableProductFiltersQuery,
  ConfirmAccountDocument,
  ConfirmAccountMutation,
  ConfirmEmailChangeDocument,
  ConfirmEmailChangeMutation,
  LanguageCodeEnum,
  OrderDetailsByTokenDocument,
  OrderDetailsByTokenQuery,
  PasswordChangeDocument,
  PasswordChangeMutation,
  ProductCollectionDocument,
  ProductCollectionQuery,
  ProductFilterInput,
  RegisterDocument,
  RegisterMutation,
  RequestEmailChangeDocument,
  RequestEmailChangeMutation,
  RequestPasswordResetDocument,
  RequestPasswordResetMutation,
  SetAddressDefaultDocument,
  SetAddressDefaultMutation,
  SetPasswordDocument,
  SetPasswordMutation,
  User,
  UserDocument,
  UserQuery,
} from "@/saleor/api";
import { saleorAuthClient } from "src/app/config";
import { LoginFormData } from "./login/LoginForm";
import { RegisterFormData } from "./register/RegisterForm";
import { STOREFRONT_URL } from "@/lib/const";
import { DEFAULT_CHANNEL, defaultRegionQuery } from "@/lib/regions";
import { ResetFormData } from "./reset/ForgotPassword";
import { ResetPasswordFormData } from "./reset/ResetPasswordForm";
import { ConfirmData } from "./confirm/ConfirmResult";

export async function logout() {
  "use server";
  saleorAuthClient().signOut();
}

export async function login(formData: LoginFormData) {
  "use server";
  const email = formData.email.toString();
  const password = formData.password.toString();

  if (!email || !password) {
    return { success: false, errors: ["Email and password are required"] };
  }

  const { data } = await saleorAuthClient().signIn({ email, password }, { cache: "no-store" });
  console.log("API response data:", data);

  if (data.tokenCreate.errors.length > 0) {
    const customError = data?.tokenCreate?.errors as any;
    return { success: false, errors: customError.map((error: { code: any }) => error.code) };
  }
  const token = data.tokenCreate.token;
  console.log("Login successful, token:", token);
  return { success: true, token: data.tokenCreate.token };
}

export async function register(formData: RegisterFormData | any) {
  try {
    interface RegisterInput {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      redirectUrl: string;
      channel: string;
      metadata?: any;
    }
    const confirmUrl = `${STOREFRONT_URL}/confirm`;
    const input: RegisterInput = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      redirectUrl: confirmUrl,
      channel: DEFAULT_CHANNEL.slug,
    };
    if (formData.nwlRegister) {
      input.metadata = [
        {
          key: "abonat_news",
          value: formData.nwlRegister,
        },
      ];
    }
    const response = await executeGraphQL<RegisterMutation, { input: RegisterInput }>(
      RegisterDocument,
      {
        variables: {
          input: input,
        },
      },
    );

    if (response?.accountRegister?.errors?.length) {
      return { success: false, errors: response.accountRegister.errors };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to execute RegisterMutation:", error);
    return { success: false };
  }
}

// export async function reset(formData: ResetPasswordFormData) {
//   try {
//     const response = await saleorAuthClient.resetPassword({
//       email: formData.email,
//       password: formData.password,
//       token: formData.token,
//     });

//     if (response.data?.setPassword?.errors?.length) {
//       const customError = response.data.setPassword.errors as any;
//       return { success: false, errors: customError.map((error: { code: any }) => error.code) };
//     }
//     return { success: true };
//   } catch (error) {
//     console.error("Failed to resetPassword:", error);
//     return { success: false };
//   }
// }

export async function setPassword(formData: ResetPasswordFormData) {
  try {
    const response = await executeGraphQL<
      SetPasswordMutation,
      { email: string; password: string; token: string }
    >(SetPasswordDocument, {
      variables: {
        email: formData.email,
        password: formData.password,
        token: formData.token,
      },
    });
    //console.log("setPassword", response.setPassword?.errors);
    if (response?.setPassword?.errors?.length) {
      const customError = response.setPassword.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to execute setPasswordMutation:", error);
    return { success: false, errors: ["INVALID"] };
  }
}

export async function requestPasswordReset(formData: ResetFormData) {
  try {
    const response = await executeGraphQL<
      RequestPasswordResetMutation,
      { email: string; channel: string; redirectUrl: string }
    >(RequestPasswordResetDocument, {
      variables: {
        email: formData.email,
        channel: DEFAULT_CHANNEL.slug,
        redirectUrl: `${STOREFRONT_URL}/reset`,
      },
    });
    console.log("requestPasswordReset", response.requestPasswordReset?.errors);
    if (response?.requestPasswordReset?.errors?.length) {
      const customError = response.requestPasswordReset.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to execute RequestPasswordResetMutation:", error);
    return { success: false };
  }
}

export async function confirmAccount(confirmData: ConfirmData) {
  try {
    const response = await executeGraphQL<ConfirmAccountMutation, { email: string; token: string }>(
      ConfirmAccountDocument,
      {
        variables: {
          email: confirmData.email,
          token: confirmData.token,
        },
      },
    );

    if (response.confirmAccount?.errors.length) {
      const customError = response.confirmAccount.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    const nwlItem = response?.confirmAccount?.user?.metadata.find(
      (meta) => meta.key === "abonat_news",
    );
    const nwlValue = nwlItem?.value;
    return { success: true, newsletter: nwlValue };
  } catch (error) {
    console.error("Failed to execute ConfirmAccountMutationResult:", error);
    return { success: false };
  }
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
  try {
    const { products } = await executeGraphQL<
      AvailableProductFiltersQuery,
      { filter: ProductFilterInput; channel: string; locale: LanguageCodeEnum }
    >(AvailableProductFiltersDocument, {
      variables: {
        filter: productsFilter,
        ...defaultRegionQuery(),
      },
      revalidate: 60 * 60,
      withAuth: false,
    });
    return products;
  } catch (error) {
    console.error("Failed to execute AvailableProductFiltersQuery", error);
    return null;
  }
}

export async function getProductCollection(queryVariables: any) {
  try {
    const { products } = await executeGraphQL<ProductCollectionQuery, { variables: any }>(
      ProductCollectionDocument,
      {
        variables: queryVariables,
        withAuth: false,
      },
    );
    return products;
  } catch (error) {
    console.error("Failed to execute graphql for products query:", error);
    return null;
  }
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

export const updateAddressMutation = async (args: { id: string; address: AddressInput }) => {
  const { id, address } = args;
  try {
    const response = await executeGraphQL<
      AccountAddressUpdateMutation,
      {
        id: string;
        address: AddressInput;
      }
    >(AccountAddressUpdateDocument, {
      variables: {
        id: id,
        address: address,
      },
      cache: "no-cache",
    });

    if (response.accountAddressUpdate?.errors.length) {
      return { errors: response.accountAddressUpdate?.errors };
    }
    return { success: true, addresses: response.accountAddressUpdate?.user?.addresses };
  } catch (error) {
    console.error("Failed to update address:", error);
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
    return { success: true, addresses: response.accountSetDefaultAddress?.user?.addresses };
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

export const saveOrderMetaDataMutation = async (args: { id: string; type: string }) => {
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
    return { success: true, addresses: response.accountSetDefaultAddress?.user?.addresses };
  } catch (error) {
    console.error("Failed to set default adresss:", error);
    return;
  }
};

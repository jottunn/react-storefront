"use server";

import { executeGraphQL } from "@/lib/graphql";
import { defaultRegionQuery } from "@/lib/regions";
import {
  CheckoutAddPromoCodeMutation,
  CheckoutBillingAddressUpdateDocument,
  CheckoutBillingAddressUpdateMutation,
  CheckoutCompleteDocument,
  CheckoutCompleteMutation,
  CheckoutCustomerAttachDocument,
  CheckoutCustomerAttachMutation,
  CheckoutEmailUpdateDocument,
  CheckoutEmailUpdateMutation,
  CheckoutLineUpdateDocument,
  CheckoutLineUpdateInput,
  CheckoutLineUpdateMutation,
  CheckoutPaymentCreateDocument,
  CheckoutPaymentCreateMutation,
  CheckoutShippingAddressUpdateDocument,
  CheckoutShippingAddressUpdateMutation,
  CheckoutShippingMethodUpdateDocument,
  CheckoutShippingMethodUpdateMutation,
  PaymentInput,
  RemoveProductFromCheckoutDocument,
  RemoveProductFromCheckoutMutation,
} from "@/saleor/api";
import { AddressFormData } from "./address/AddressForm";

type updateEmailFromCheckoutArgs = {
  id: string;
  email: string;
};
type CheckoutEmailUpdateMutationVariables = {
  id: string;
  email: string;
  locale: string;
};
export const checkoutEmailUpdate = async ({ id, email }: updateEmailFromCheckoutArgs) => {
  try {
    const response = await executeGraphQL<
      CheckoutEmailUpdateMutation,
      CheckoutEmailUpdateMutationVariables
    >(CheckoutEmailUpdateDocument, {
      variables: {
        email: email,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    console.log(response.checkoutEmailUpdate?.errors);
    if (response.checkoutEmailUpdate?.errors.length) {
      const customError = response.checkoutEmailUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutEmailUpdate?.checkout };
  } catch (error) {
    console.error("Failed to add email to checkout:", error);
    return;
  }
};

type CheckoutCustomerAttachVariables = {
  id: string;
  locale: string;
};
export const customerAttach = async (id: string) => {
  try {
    const response = await executeGraphQL<
      CheckoutCustomerAttachMutation,
      CheckoutCustomerAttachVariables
    >(CheckoutCustomerAttachDocument, {
      variables: {
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    console.log(response.checkoutCustomerAttach?.errors);
    if (response.checkoutCustomerAttach?.errors.length) {
      const customError = response.checkoutCustomerAttach.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutCustomerAttach?.checkout };
  } catch (error) {
    console.error("Failed to attach customer to checkout:", error);
    return;
  }
};

export const checkoutBillingAddressUpdate = async (args: {
  address: AddressFormData;
  id: string;
}) => {
  const { address, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutBillingAddressUpdateMutation,
      {
        address: AddressFormData;
        id: string;
        locale: string;
      }
    >(CheckoutBillingAddressUpdateDocument, {
      variables: {
        address: address,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    console.log(response.checkoutBillingAddressUpdate?.errors);
    if (response.checkoutBillingAddressUpdate?.errors.length) {
      const customError = response.checkoutBillingAddressUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutBillingAddressUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Billing Address on checkout:", error);
    return;
  }
};

export const checkoutShippingAddressUpdate = async (args: {
  address: AddressFormData;
  id: string;
}) => {
  const { address, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutShippingAddressUpdateMutation,
      {
        address: AddressFormData;
        locale: string;
        id: string;
      }
    >(CheckoutShippingAddressUpdateDocument, {
      variables: {
        address: address,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    console.log("checkoutShippingAddressUpdate", response.checkoutShippingAddressUpdate?.errors);
    if (response.checkoutShippingAddressUpdate?.errors.length) {
      const customError = response.checkoutShippingAddressUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutShippingAddressUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Shipping Address on checkout:", error);
    return;
  }
};

export const checkoutShippingMethodUpdate = async (args: {
  shippingMethodId: string;
  id: string;
}) => {
  const { shippingMethodId, id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutShippingMethodUpdateMutation,
      {
        shippingMethodId: string;
        locale: string;
        id: string;
      }
    >(CheckoutShippingMethodUpdateDocument, {
      variables: {
        shippingMethodId: shippingMethodId,
        id: id,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    if (response.checkoutShippingMethodUpdate?.errors.length) {
      const customError = response.checkoutShippingMethodUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutShippingMethodUpdate?.checkout };
  } catch (error) {
    console.error("Failed to update Shipping Method on checkout:", error);
    return;
  }
};

export const checkoutPaymentCreateMutation = async (args: { id: string; input: PaymentInput }) => {
  const { id, input } = args;
  try {
    const response = await executeGraphQL<
      CheckoutPaymentCreateMutation,
      {
        id: string;
        input: PaymentInput;
      }
    >(CheckoutPaymentCreateDocument, {
      variables: {
        input: input,
        id: id,
      },
      cache: "no-cache",
    });

    if (response.checkoutPaymentCreate?.errors.length) {
      const customError = response.checkoutPaymentCreate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to create Payment on checkout:", error);
    return;
  }
};

export const checkoutCompleteMutation = async (args: { id: string }) => {
  const { id } = args;
  try {
    const response = await executeGraphQL<
      CheckoutCompleteMutation,
      {
        id: string;
      }
    >(CheckoutCompleteDocument, {
      variables: {
        id: id,
      },
      cache: "no-cache",
    });

    if (response.checkoutComplete?.errors.length) {
      const customError = response.checkoutComplete.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, order: response?.checkoutComplete?.order };
  } catch (error) {
    console.error("Failed to complete checkout:", error);
    return;
  }
};

export const checkoutAddPromoCodeMutation = async (args: { id: string; promoCode: String }) => {
  const { id, promoCode } = args;
  try {
    const response = await executeGraphQL<
      CheckoutAddPromoCodeMutation,
      {
        id: string;
        promoCode: String;
        locale: string;
      }
    >(CheckoutCompleteDocument, {
      variables: {
        id: id,
        promoCode: promoCode,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });

    if (response.checkoutAddPromoCode?.errors.length) {
      const customError = response.checkoutAddPromoCode.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response?.checkoutAddPromoCode?.checkout };
  } catch (error) {
    console.error("Failed to add Promo Code on checkout:", error);
    return;
  }
};

type removeLineFromCheckoutArgs = {
  lineId: string;
  checkoutId: string;
};
type RemoveProductFromCheckoutVariables = {
  id: string;
  lineId: string;
  locale: string;
};

export const deleteLineFromCheckout = async ({
  lineId,
  checkoutId,
}: removeLineFromCheckoutArgs) => {
  try {
    const response = await executeGraphQL<
      RemoveProductFromCheckoutMutation,
      RemoveProductFromCheckoutVariables
    >(RemoveProductFromCheckoutDocument, {
      variables: {
        id: checkoutId,
        lineId: lineId,
        locale: defaultRegionQuery().locale,
      },
      cache: "no-cache",
    });
    console.log(response);
    if (response.checkoutLineDelete?.errors.length) {
      const customError = response.checkoutLineDelete.errors as any;
      console.log(customError);
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutLineDelete?.checkout };
  } catch (error) {
    console.error("Failed to remove checkout line:", error);
    return;
  }
};

type updateLineFromCheckoutArgs = {
  lineUpdateInput: CheckoutLineUpdateInput;
  checkoutId: string;
};
type CheckoutLineUpdateVariables = {
  checkoutId: string;
  lines: CheckoutLineUpdateInput[];
  locale: string;
};
export const updateLineFromCheckout = async ({
  lineUpdateInput,
  checkoutId,
}: updateLineFromCheckoutArgs) => {
  try {
    const response = await executeGraphQL<CheckoutLineUpdateMutation, CheckoutLineUpdateVariables>(
      CheckoutLineUpdateDocument,
      {
        variables: {
          checkoutId: checkoutId,
          lines: [lineUpdateInput],
          locale: defaultRegionQuery().locale,
        },
        cache: "no-cache",
      },
    );

    console.log(response.checkoutLinesUpdate?.errors);
    if (response.checkoutLinesUpdate?.errors.length) {
      const customError = response.checkoutLinesUpdate.errors as any;
      return { success: false, errors: customError.map((error: { code: any }) => error.code) };
    }
    return { success: true, checkout: response.checkoutLinesUpdate?.checkout };
  } catch (error) {
    console.error("Failed to remove checkout line:", error);
    return;
  }
};
